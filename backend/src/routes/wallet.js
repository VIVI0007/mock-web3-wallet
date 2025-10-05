// src/routes/wallet.js
import express from 'express';
import { createWallet, getBalance } from '../controllers/walletController.js';

const router = express.Router();

router.post('/create', createWallet);
router.get('/:address/balance', getBalance);

export default router;
