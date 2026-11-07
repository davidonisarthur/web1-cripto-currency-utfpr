import { COINS, normalizeQuotes } from './core.js';

export async function fetchQuotes(fetcher = fetch) {
  const query = new URLSearchParams({
    ids: COINS.map(coin => coin.id).join(','), vs_currencies: 'brl,usd',
    include_24hr_change: 'true', include_last_updated_at: 'true',
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetcher(`https://api.coingecko.com/api/v3/simple/price?${query}`, {
      signal: controller.signal, headers: { Accept: 'application/json' },
    });
    if (response.status === 429) throw new Error('Limite de consultas da fonte atingido. Aguarde um minuto antes de tentar novamente.');
    if (!response.ok) throw new Error('A fonte está indisponível no momento. Tente novamente mais tarde.');
    return normalizeQuotes(await response.json());
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('A consulta demorou demais. Confira sua conexão e tente novamente.');
    if (error instanceof TypeError) throw new Error('Não foi possível acessar a fonte. Confira sua conexão e tente novamente.');
    if (error instanceof SyntaxError) throw new Error('A fonte retornou uma resposta inválida. Tente novamente mais tarde.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
