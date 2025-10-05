
export default function TxHistory({ txs }) {
  return (
    <div className="card">
      <h3>Transaction History</h3>
      {(!txs || txs.length === 0) ? <div>No transactions yet.</div> :
        <table style={{width:'100%'}}>
          <thead><tr><th>When</th><th>From</th><th>To</th><th>ETH</th><th>USD</th></tr></thead>
          <tbody>
            {txs.map(t => (
              <tr key={t.txId}>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
                <td style={{fontFamily:'monospace'}}>{t.from}</td>
                <td style={{fontFamily:'monospace'}}>{t.to}</td>
                <td>{t.amountEth}</td>
                <td>{t.amountUsd ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    </div>
  );
}
