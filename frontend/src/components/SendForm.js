import { Wallet } from 'ethers';
import { useState } from 'react';
import { confirmApproval, requestApproval } from '../services/api';

export default function SendForm({ wallet, onDone }) {
  const [to, setTo] = useState('');
  const [amountType, setAmountType] = useState('ETH'); // ETH or USD
  const [amount, setAmount] = useState('');
  const [messageToSign, setMessageToSign] = useState(null);
  const [approvalObj, setApprovalObj] = useState(null);
  const [busy, setBusy] = useState(false);

  async function startApproval() {
    setBusy(true);
    try {
      const payload = { from: wallet.address.toLowerCase(), to: to.toLowerCase() };
      if (amountType === 'ETH') payload.amountEth = String(amount);
      else payload.amountUsd = Number(amount);
      const resp = await requestApproval(payload);
      setMessageToSign(resp.message);
      setApprovalObj(resp.approval);
    } catch (err) {
      alert('Error creating approval: ' + (err?.response?.data?.error || err.message));
    } finally {
      setBusy(false);
    }
  }

  async function signAndConfirm() {
    setBusy(true);
    try {
      // sign message with mnemonic on frontend
      const w = Wallet.fromPhrase(wallet.mnemonic);
      const sig = await w.signMessage(messageToSign);
      const resp = await confirmApproval({ approval: approvalObj, signature: sig });
      if (resp.success) {
        alert('Transfer success. TxId: ' + resp.txId);
        setMessageToSign(null);
        setApprovalObj(null);
        setTo(''); setAmount('');
        if (onDone) await onDone();
      } else {
        alert('Transfer failed: ' + JSON.stringify(resp));
      }
    } catch (err) {
      alert('Error confirming: ' + (err?.response?.data?.error || err.message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h3>Send Mock ETH</h3>
      <div>
        <label>To address</label>
        <input value={to} onChange={e => setTo(e.target.value)} placeholder="0x..." />
      </div>
      <div>
        <label>Amount</label>
        <select value={amountType} onChange={e => setAmountType(e.target.value)}>
          <option value="ETH">ETH</option>
          <option value="USD">USD</option>
        </select>
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder={amountType === 'ETH' ? '0.5' : '1000'} />
      </div>

      {!messageToSign ? (
        <button onClick={startApproval} disabled={busy}>Request Approval</button>
      ) : (
        <div style={{marginTop:10}}>
          <div className="approvalBox"><strong>Approval Message to Sign:</strong><div style={{fontFamily:'monospace', marginTop:6}}>{messageToSign}</div></div>
          <button onClick={signAndConfirm} disabled={busy}>Sign & Confirm</button>
          <button onClick={() => { setMessageToSign(null); setApprovalObj(null); }} disabled={busy}>Cancel</button>
        </div>
      )}
    </div>
  );
}
