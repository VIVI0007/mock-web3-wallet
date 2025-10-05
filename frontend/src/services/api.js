import axios from 'axios';
const BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export async function createWalletBackend(mnemonic) {
  return axios.post(`${BASE}/wallet/create`, { mnemonic }).then(r => r.data);
}

export async function getBalance(address) {
  return axios.get(`${BASE}/wallet/${address}/balance`).then(r => r.data).catch(err => ({}));
}

export async function requestApproval(body) {
  return axios.post(`${BASE}/tx/approval`, body).then(r => r.data);
}

export async function confirmApproval(body) {
  return axios.post(`${BASE}/tx/confirm`, body).then(r => r.data);
}

export async function getHistory(address) {
  return axios.get(`${BASE}/tx/history/${address}`).then(r => r.data);
}
