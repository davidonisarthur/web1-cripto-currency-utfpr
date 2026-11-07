export const COINS = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
];
export const CURRENCIES = ['brl', 'usd'];

export function parseAmount(value) {
  const text = String(value).trim();
  if (!/^\d+(?:[.,]\d{1,8})?$/.test(text)) return null;
  const amount = Number(text.replace(',', '.'));
  return Number.isFinite(amount) && amount > 0 && amount <= 1e9 ? amount : null;
}

export function money(value, currency) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: currency.toUpperCase(),
    minimumFractionDigits: 2, maximumFractionDigits: value > 0 && value < 0.01 ? 8 : 2,
  }).format(value);
}

export function validQuote(value, currency) {
  return value && typeof value[currency] === 'number' && Number.isFinite(value[currency])
    && value[currency] > 0 && Number.isFinite(value.last_updated_at)
    && value.last_updated_at > 0 && value.last_updated_at <= Date.now() / 1000 + 300;
}

export function normalizeQuotes(data) {
  if (!data || typeof data !== 'object') throw new Error('A fonte retornou uma resposta inválida.');
  const quotes = {};
  for (const coin of COINS) {
    const row = data[coin.id];
    if (!CURRENCIES.every(currency => validQuote(row, currency))) continue;
    quotes[coin.id] = {
      brl: row.brl, usd: row.usd, last_updated_at: row.last_updated_at,
      brl_24h_change: Number.isFinite(row.brl_24h_change) ? row.brl_24h_change : null,
      usd_24h_change: Number.isFinite(row.usd_24h_change) ? row.usd_24h_change : null,
    };
  }
  if (!Object.keys(quotes).length) throw new Error('A fonte não retornou cotações válidas. Tente novamente mais tarde.');
  return quotes;
}
