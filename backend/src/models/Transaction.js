// src/models/Transaction.js
import mongoose from 'mongoose';

const TxSchema = new mongoose.Schema({
  txId: { type: String, index: true }, // internal id
  from: String,
  to: String,
  amountWei: String,
  amountEth: String,
  amountUsd: Number,
  note: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Transaction', TxSchema);
