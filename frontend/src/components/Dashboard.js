import { useEffect, useState } from 'react';
import { getHistory } from '../services/api';
import SendForm from './SendForm';
import TxHistory from './TxHistory';

export default function Dashboard({ wallet, refreshBalance, onLogout }) {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line
  }, []);

  async function loadHistory() {
    const res = await getHistory(wallet.address);
    if (res && res.txs) setTxs(res.txs);
  }

  async function refresh() {
    if (refreshBalance) await refreshBalance();
    await loadHistory();
  }

  return (
    <div>
      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <h3>Address</h3>
            <div style={{fontFamily:'monospace'}}>{wallet.address}</div>
            <h3>Balance</h3>
            <div><strong>{wallet.balanceEth ?? '...' } ETH</strong></div>
          </div>
          <div>
            <button onClick={refresh}>Refresh</button>
            <button onClick={onLogout}>Logout</button>
          </div>
        </div>
      </div>

      <SendForm wallet={wallet} onDone={refresh} />
      <TxHistory txs={txs} />
    </div>
  );
}
