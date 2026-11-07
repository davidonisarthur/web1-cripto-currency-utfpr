import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAmount, normalizeQuotes, money } from '../js/core.js';
import { fetchQuotes } from '../js/api.js';

test('aceita vírgula, ponto e frações de cripto; rejeita entradas ambíguas', () => {
  assert.equal(parseAmount('0,5'), 0.5);
  assert.equal(parseAmount('0.00000001'), 0.00000001);
  for (const input of ['', '-1', '0', '1.000,50', 'Infinity', '1e4', '1.2.3', '1000000001', '0.000000001']) assert.equal(parseAmount(input), null);
});
test('preserva a ausência de variação e descarta moedas com dados inválidos', () => {
  const quotes = normalizeQuotes({ bitcoin: { brl: 400000, usd: 80000, brl_24h_change: null, last_updated_at: Date.now()/1000 }, ethereum: { brl: 0 } });
  assert.equal(quotes.bitcoin.brl_24h_change, null);
  assert.equal(quotes.ethereum, undefined);
  assert.throws(() => normalizeQuotes({ bitcoin: { brl: null, usd: 1, last_updated_at: 1 } }));
  assert.match(money(0.0001, 'brl'), /0,0001/);
});
test('trata limite HTTP e falhas de rede sem expor dados fictícios', async () => {
  await assert.rejects(fetchQuotes(async () => ({ status: 429, ok: false })), /Limite/);
  await assert.rejects(fetchQuotes(async () => { throw new TypeError('network'); }), /conexão/);
  await assert.rejects(fetchQuotes(async () => ({ ok: true, json: async () => ({}) })), /válidas/);
});
