import { Wallet } from 'ethers';
import { useState } from 'react';
import { createWalletBackend } from '../services/api';

export default function CreateImportWallet({ onCreated }) {
  const [mnemonic, setMnemonic] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = () => {
    const w = Wallet.createRandom();
    setMnemonic(w.mnemonic.phrase);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const resp = await createWalletBackend(mnemonic || undefined);
      // resp contains address, mnemonic, balanceEth
      onCreated({ address: resp.address.toLowerCase(), mnemonic: resp.mnemonic, balanceEth: resp.balanceEth });
    } catch (err) {
      alert('Error creating wallet: ' + (err?.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Create or Import Wallet</h2>
      <div>
        <button onClick={generate}>Generate 12-word mnemonic</button>
      </div>
      <textarea value={mnemonic} onChange={(e) => setMnemonic(e.target.value)} rows={3} placeholder="Paste your 12-word phrase here to import" />
      <div>
        <button onClick={submit} disabled={loading}>{loading ? 'Creating...' : 'Create / Import'}</button>
      </div>
      <p style={{fontSize:12, color:'#555'}}>Note: For this mock wallet your mnemonic is stored locally and in the backend for demo purposes only.</p>
    </div>
  );
}
