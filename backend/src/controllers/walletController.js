

// src/controllers/walletController.js
import { ethers } from 'ethers';
import WalletModel from '../models/Wallet.js';
const { parseUnits, formatUnits } = ethers;

// Create new wallet from mnemonic (or generate)
export async function createWallet(req, res) {
  try {
    let { mnemonic } = req.body;

    // Generate random mnemonic if not provided
    if (!mnemonic) {
      mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
    }

    // Derive wallet
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    const address = wallet.address;

    // Random mock balance between 1 and 10 ETH
    const balanceEth = (Math.random() * 9 + 1).toFixed(6);
    const balanceWei = parseUnits(balanceEth, 18).toString();

    // Save to DB
    let w = await WalletModel.findOne({ address });
    if (!w) {
      w = new WalletModel({ address, mnemonic, balanceWei });
      await w.save();
    } else {
      if (req.body.mnemonic) w.mnemonic = mnemonic;
      if (!w.balanceWei || w.balanceWei === '0') {
        w.balanceWei = balanceWei;
      }
      await w.save();
    }

    res.json({
      address,
      mnemonic,
      balanceEth: formatUnits(w.balanceWei, 18),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function getBalance(req, res) {
  try {
    const { address } = req.params;
    const w = await WalletModel.findOne({ address });
    if (!w) return res.status(404).json({ error: 'Wallet not found' });
    res.json({
      address: w.address,
      balanceEth: formatUnits(w.balanceWei, 18),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
