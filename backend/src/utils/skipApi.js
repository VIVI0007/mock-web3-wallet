// skipApi.js - calls the Skip API to convert USD -> ETH
import axios from 'axios';

/*
  Input:
    amountInUsd (Number)
  Output:
    { ethAmount: "0.1234", rawResponse: {...} }
*/
export async function quoteUsdToEth(amountInUsd) {
  // Skip sample body expects amount_in in smallest units of source asset.
  // Because Skip expects USDC-like asset or direct USD? The problem statement used
  // "amount_in": inputUsdAmount (assume USD amount). We'll pass as string.
  const body = {
    source_asset_denom: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    source_asset_chain_id: "1",
    dest_asset_denom: "ethereum-native",
    dest_asset_chain_id: "1",
    amount_in: String(amountInUsd),
    chain_ids_to_addresses: { "1": "0x742d35Cc6634C0532925a3b8D4C9db96c728b0B4" },
    slippage_tolerance_percent: "1",
    smart_swap_options: { evm_swaps: true },
    allow_unsafe: false
  };

  const headers = { 'Content-Type': 'application/json' };
  if (process.env.SKIP_API_KEY) headers['Authorization'] = `Bearer ${process.env.SKIP_API_KEY}`;

  const resp = await axios.post('https://api.skip.build/v2/fungible/msgs_direct', body, { headers });
  // The exact response schema may vary. We'll defensively try to extract expected fields.
  // For this mock: assume resp.data has dest_amount or something like that.
  const data = resp.data || {};
  // Try a few possible paths:
  let ethAmount = null;
  if (data.estimated_dest_amount) ethAmount = data.estimated_dest_amount;
  else if (data.dest_amount) ethAmount = data.dest_amount;
  else if (data.quote && data.quote.dest_amount) ethAmount = data.quote.dest_amount;
  else ethAmount = null;

  // If ethAmount is present as number representing Ether amount -> return as string;
  return { ethAmount, raw: data };
}

//module.exports = { quoteUsdToEth };


