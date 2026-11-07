import { COINS, money, parseAmount } from './core.js';
import { fetchQuotes } from './api.js';
import { readPreferences, savePreferences } from './storage.js';

const $ = id => document.getElementById(id);
let quotes = {};
let loading = false;
let lastAttempt = 0;
let refreshFailed = false;
let resultText = '';
let storage;
try { storage = window.localStorage; } catch { /* A consulta funciona sem armazenamento. */ }
const preferences = readPreferences(storage);
$('coin').value = preferences.coin;
$('currency').value = preferences.currency;
$('share').hidden = typeof navigator.share !== 'function';

function render() {
  const coin = COINS.find(item => item.id === $('coin').value);
  const currency = $('currency').value;
  const amount = parseAmount($('amount').value);
  const quote = quotes[coin.id];
  $('amount').setAttribute('aria-invalid', String(amount === null));
  $('amount-error').hidden = amount !== null;
  $('amount-error').textContent = amount === null ? 'Informe um valor maior que zero, até 1 bilhão, com no máximo 8 casas decimais.' : '';
  $('total').textContent = quote && amount !== null ? money(amount * quote[currency], currency) : '—';
  $('unit-price').textContent = quote ? `1 ${coin.symbol} = ${money(quote[currency], currency)}` : 'Sem cotação disponível para esta moeda.';
  const change = quote?.[`${currency}_24h_change`];
  $('change').className = Number.isFinite(change) ? (change >= 0 ? 'positive' : 'negative') : '';
  $('change').textContent = Number.isFinite(change)
    ? `${change >= 0 ? '+' : ''}${change.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% em 24h`
    : 'Variação em 24h indisponível';
  const stale = quote && Date.now() / 1000 - quote.last_updated_at > 300;
  const time = quote ? new Date(quote.last_updated_at * 1000).toLocaleString('pt-BR') : '';
  $('updated').textContent = quote ? `Fonte: ${time}${stale || refreshFailed ? ' · Cotação anterior' : ''}` : 'Aguardando consulta';
  $('market-list').replaceChildren(...COINS.map(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} · ${item.symbol}`;
    const price = document.createElement('span');
    price.textContent = quotes[item.id] ? money(quotes[item.id][currency], currency) : 'Indisponível';
    li.append(price);
    return li;
  }));
  resultText = quote && amount !== null ? `${amount.toLocaleString('pt-BR', { maximumFractionDigits: 8 })} ${coin.symbol} ≈ ${money(amount * quote[currency], currency)}. Cotação de referência: ${time}${stale || refreshFailed ? ' (cotação anterior)' : ''}. Fonte: CoinGecko. Sem taxas de negociação.` : '';
  $('copy').disabled = !resultText || loading;
  $('share').disabled = !resultText || loading;
}

async function refresh() {
  if (loading) return;
  const remaining = Math.ceil((60000 - (Date.now() - lastAttempt)) / 1000);
  if (remaining > 0) {
    $('status').textContent = `Aguarde ${remaining}s para uma nova consulta. Você pode continuar convertendo com os dados disponíveis.`;
    return;
  }
  loading = true;
  lastAttempt = Date.now();
  $('refresh').disabled = true;
  $('result').setAttribute('aria-busy', 'true');
  $('status').textContent = 'Consultando cotações na CoinGecko…';
  render();
  try {
    quotes = await fetchQuotes();
    refreshFailed = false;
    $('status').textContent = 'Consulta concluída. Troque a moeda ou a quantidade para converter sem uma nova consulta.';
  } catch (error) {
    refreshFailed = true;
    $('status').textContent = `${error.message}${Object.keys(quotes).length ? ' Mantivemos as cotações anteriores; confira o horário da fonte.' : ''}`;
  } finally {
    loading = false;
    $('refresh').disabled = false;
    $('result').setAttribute('aria-busy', 'false');
    render();
  }
}

$('quote-form').addEventListener('submit', event => { event.preventDefault(); refresh(); });
for (const id of ['coin', 'currency', 'amount']) {
  $(id).addEventListener(id === 'amount' ? 'input' : 'change', () => {
    $('action-status').textContent = '';
    $('manual-copy').hidden = true;
    if (id !== 'amount') {
      const saved = savePreferences(storage, { coin: $('coin').value, currency: $('currency').value });
      $('preference-status').textContent = saved ? 'Moeda e unidade salvas somente neste navegador.' : 'O navegador não permitiu salvar suas preferências. A consulta continua funcionando.';
    }
    render();
  });
}

function showManualCopy(text) {
  $('manual-copy').hidden = false;
  $('copy-text').value = text;
  $('copy-text').focus();
  $('copy-text').select();
  $('action-status').textContent = 'Não foi possível copiar automaticamente. Copie o texto selecionado abaixo.';
}

$('copy').addEventListener('click', async () => {
  if (!resultText) return;
  const text = resultText;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard indisponível');
    await navigator.clipboard.writeText(text);
    $('action-status').textContent = 'Resultado copiado com a fonte e o horário da cotação.';
  } catch { showManualCopy(text); }
});
$('share').addEventListener('click', async () => {
  if (!resultText || !navigator.share) return;
  try {
    await navigator.share({ title: 'CriptoCotação', text: resultText });
    $('action-status').textContent = 'Resultado compartilhado.';
  } catch (error) {
    $('action-status').textContent = error.name === 'AbortError' ? 'Compartilhamento cancelado.' : 'Não foi possível compartilhar. Use Copiar resultado.';
  }
});
render();
refresh();
// Reavalia a indicação de cotação antiga sem consultar a API automaticamente.
setInterval(render, 60000);
