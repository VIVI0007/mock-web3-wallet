// src/models/Wallet.js
import mongoose from 'mongoose';

const WalletSchema = new mongoose.Schema({
  address: { type: String, unique: true, index: true },
  mnemonic: { type: String }, // stored here for the mock project (insecure in real app)
  balanceWei: { type: String, default: '0' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Wallet', WalletSchema);
