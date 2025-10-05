
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();
//const cors = require('cors');

//const walletRoutes = require('./src/routes/wallet');
//const txRoutes = require('./src/routes/tx');

import cors from 'cors';
import express from 'express';
import txRoutes from './src/routes/tx.js';
import walletRoutes from './src/routes/wallet.js';

const app = express();
app.use(cors({ origin: process.env.APP_ORIGIN || '*' }));
app.use(express.json());

app.use('/api/wallet', walletRoutes);
app.use('/api/tx', txRoutes);

const PORT = process.env.PORT || 4000;
console.log(process.env.MONGO_URI)
mongoose.connect(process.env.MONGO_URI, { })
  .then(() => {
    console.log('Mongo connected');
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch(err => console.error(err));
