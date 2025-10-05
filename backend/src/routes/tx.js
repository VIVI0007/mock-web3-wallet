// src/routes/tx.js
import express from 'express';
import { confirmApproval, createApproval, getTransactions } from '../controllers/txController.js';

const router = express.Router();

router.post('/approval', createApproval);
router.post('/confirm', confirmApproval);
router.get('/history/:address', getTransactions);

export default router;
