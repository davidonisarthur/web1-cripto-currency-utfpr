import { COINS, CURRENCIES } from './core.js';

const KEY = 'criptocotacao:preferences:v1';
export function readPreferences(storage) {
  try {
    const data = JSON.parse(storage.getItem(KEY));
    return {
      coin: COINS.some(coin => coin.id === data?.coin) ? data.coin : 'bitcoin',
      currency: CURRENCIES.includes(data?.currency) ? data.currency : 'brl',
    };
  } catch {
    return { coin: 'bitcoin', currency: 'brl' };
  }
}
export function savePreferences(storage, preferences) {
  try {
    storage.setItem(KEY, JSON.stringify(preferences));
    return true;
  } catch {
    return false;
  }
}
