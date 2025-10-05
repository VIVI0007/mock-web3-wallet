import { useEffect, useState } from 'react';
import CreateImportWallet from './components/CreateImportWallet';
import Dashboard from './components/Dashboard';
import { getBalance } from './services/api';

function App() {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('cypherd_wallet');
    if (stored) setWallet(JSON.parse(stored));
  }, []);

  function onWalletCreated(w) {
    localStorage.setItem('cypherd_wallet', JSON.stringify(w));
    setWallet(w);
  }

  async function refreshBalance() {
    if (!wallet) return;
    const resp = await getBalance(wallet.address);
    if (resp && resp.balanceEth) {
      setWallet(prev => ({ ...prev, balanceEth: resp.balanceEth }));
      localStorage.setItem('cypherd_wallet', JSON.stringify({ ...wallet, balanceEth: resp.balanceEth }));
    }
  }

  return (
    <div className="container">
      <h1>CypherD Mock Wallet (Hackathon)</h1>
      {!wallet ? (
        <CreateImportWallet onCreated={onWalletCreated} />
      ) : (
        <Dashboard wallet={wallet} refreshBalance={refreshBalance} onLogout={() => { localStorage.removeItem('cypherd_wallet'); setWallet(null); }} />
      )}
    </div>
  );
}

export default App;
