

import axios from 'axios';

export async function notifyTelegram(chatId, botToken, message) {
  if (!chatId || !botToken) {
    console.log('[Notifier] Telegram not configured. Message:', message);
    return;
  }
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    await axios.post(url, { chat_id: chatId, text: message });
  } catch (err) {
    console.error('[Notifier] Telegram error:', err.message);
  }
}
