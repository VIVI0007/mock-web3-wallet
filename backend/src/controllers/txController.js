// src/controllers/txController.js

import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import Tx from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import { notifyTelegram } from '../utils/notifier.js';
import { quoteUsdToEth } from '../utils/skipApi.js';

const PRICE_TOLERANCE = 0.01; // 1% tolerance

// Create approval message for a transfer request
// body: { from, to, amountEth (optional), amountUsd (optional) }
export async function createApproval(req, res) {
  try {
    const { from, to, amountEth, amountUsd } = req.body;
    if (!from || !to || (!amountEth && !amountUsd))
      return res.status(400).json({ error: 'missing fields' });

    let ethAmount = amountEth;
    let amountUsdVal = null;
    let quoteRaw = null;

    if (amountUsd) {
      // Call Skip API to convert USD -> ETH
      const quote = await quoteUsdToEth(Number(amountUsd));
      quoteRaw = quote.raw;
      if (!quote.ethAmount)
        return res.status(500).json({ error: 'skip quote failed' });

      // The quoted value may be token units; assume ethAmount as numeric string of ETH
      ethAmount = String(quote.ethAmount);
      amountUsdVal = Number(amountUsd);
    }

    // prepare approval object
    const expiresAt = Date.now() + 30 * 1000; // 30 seconds
    const approvalObj = {
      id: uuidv4(),
      from,
      to,
      ethAmount,
      amountUsd: amountUsdVal,
      expiresAt,
    };

    // Message string to be signed
    const message = `Approve transfer ${ethAmount} ETH to ${to} from ${from}. ExpiresAt:${expiresAt}`;

    res.json({ approval: approvalObj, message, quoteRaw });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// Confirm signed approval: body { approval, signature }
export async function confirmApproval(req, res) {
  try {
    const { approval, signature } = req.body;
    if (!approval || !signature)
      return res.status(400).json({ error: 'missing approval or signature' });

    // Basic expiry check
    if (Date.now() > approval.expiresAt)
      return res.status(400).json({ error: 'approval expired' });

    // Recreate message and verify
    const message = `Approve transfer ${approval.ethAmount} ETH to ${approval.to} from ${approval.from}. ExpiresAt:${approval.expiresAt}`;
    const recovered = ethers.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== approval.from.toLowerCase()) {
      return res.status(400).json({ error: 'invalid signature' });
    }

    // If approval had amountUsd, re-quote Skip API and enforce tolerance
    if (approval.amountUsd) {
      const quoteNow = await quoteUsdToEth(Number(approval.amountUsd));
      const proposedEth = Number(approval.ethAmount);
      const newEth = Number(
        quoteNow.ethAmount ||
          quoteNow.estimated_dest_amount ||
          quoteNow.dest_amount ||
          0
      );
      if (
        !newEth ||
        Math.abs(newEth - proposedEth) / proposedEth > PRICE_TOLERANCE
      ) {
        return res
          .status(400)
          .json({ error: 'price changed beyond tolerance' });
      }
    }

    // Now move balances in DB
    const wFrom = await Wallet.findOne({ address: approval.from.toLowerCase() });
    const wTo = await Wallet.findOne({ address: approval.to.toLowerCase() });

    if (!wFrom) return res.status(404).json({ error: 'sender wallet not found' });

    const weiAmount = ethers.parseUnits(String(approval.ethAmount), 18);
    const fromBalance = BigInt(wFrom.balanceWei);

    if (fromBalance < BigInt(weiAmount))
      return res.status(400).json({ error: 'insufficient funds' });

    // subtract and add
    wFrom.balanceWei = (fromBalance - BigInt(weiAmount)).toString();
    if (wTo) {
      wTo.balanceWei = (BigInt(wTo.balanceWei) + BigInt(weiAmount)).toString();
      await wTo.save();
    } else {
      const newRecipient = new Wallet({
        address: approval.to.toLowerCase(),
        mnemonic: '',
        balanceWei: weiAmount.toString(),
      });
      await newRecipient.save();
    }
    await wFrom.save();

    const tx = new Tx({
      txId: uuidv4(),
      from: approval.from,
      to: approval.to,
      amountWei: weiAmount.toString(),
      amountEth: String(approval.ethAmount),
      amountUsd: approval.amountUsd || null,
    });
    await tx.save();

    // send Telegram notification
    const msg = `Transfer successful: ${approval.ethAmount} ETH from ${approval.from} to ${approval.to}`;
    await notifyTelegram(
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_BOT_TOKEN,
      msg
    );

    res.json({ success: true, txId: tx.txId, tx });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function getTransactions(req, res) {
  try {
    const { address } = req.params;
    const txs = await Tx.find({
      $or: [{ from: address }, { to: address }],
    })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ txs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
