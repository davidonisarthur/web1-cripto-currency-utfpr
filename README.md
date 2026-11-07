# CriptoCotação

**Autor:** Arthur Otavio Rodrigues Davidonis.

**Site:** https://davidonisarthur.github.io/web1-cripto-currency-utfpr/

Serviço acadêmico para consultar Bitcoin, Ethereum e Solana em reais e dólares. HTML, CSS e JavaScript puro; sem back-end, frameworks, carteira ou cadastro.

## Executar

Na pasta do projeto, execute `python -m http.server 8000` e abra http://localhost:8000.

## Etapas

As branches são encadeadas; cada etapa inclui a anterior:

1. `feat/interface-cotador`: estrutura semântica e interface Mobile First.
2. `feat/cotacoes-conversao`: API pública, conversão, carregamento e tratamento de erros.
3. `feat/preferencias-compartilhamento`: preferências locais, Clipboard/Share, testes e documentação.

O rodapé aponta para o [site pessoal do autor](https://davidonisarthur.github.io/site-pessoal-web1-utfpr/).

## Recursos

- Bitcoin, Ethereum e Solana, com preço em BRL e USD e variação de 24 horas.
- Conversão local com vírgula ou ponto decimal, até oito casas decimais.
- Consulta na abertura e atualização manual; intervalo mínimo de 60 segundos entre tentativas na mesma página.
- Uma chamada reúne as três moedas e as duas unidades. Trocar a seleção ou quantidade não gera novas requisições.
- Horário da fonte, indicação de cotações anteriores, resposta parcial, limite HTTP 429 e timeout de 12 segundos.
- Preferências de moeda e unidade no `localStorage`, com tolerância a armazenamento bloqueado ou corrompido.
- Clipboard com alternativa manual e Web Share nos navegadores compatíveis. A quantidade não é salva nem enviada à API.
- Layout Mobile First, rótulos, mensagens de status e foco de teclado.

## API e assincronismo

[CoinGecko Keyless Public API](https://docs.coingecko.com/docs/keyless-public-api), endpoint [`/simple/price`](https://docs.coingecko.com/reference/simple-price). Não usa chaves ou segredos. `fetch`, Promises e `async/await` consultam os dados; `AbortController` limita o tempo de espera. As moedas são agrupadas em uma requisição, dispensando consultas paralelas redundantes.

A API pública tem limites compartilhados por IP e pode ficar indisponível. É adequada ao protótipo acadêmico, sem garantia de disponibilidade para produção. Dados são atribuídos à CoinGecko na interface. Nenhum preço fictício é usado em caso de erro. Valores de referência não incluem taxas de corretoras.

## Verificação

Execute `npm test` com Node.js (sem instalar dependências). Testes cobrem quantidades inválidas, resposta incompleta, variação ausente, erro de rede, limite da API e armazenamento bloqueado/corrompido.

Também foi feita verificação no Chromium: consulta real à API, ausência de rolagem horizontal em 375, 768 e 1200 px; conversão, preferências após recarregar, cópia manual quando a permissão é negada e erro HTTP 429 com respostas simuladas. Os dados simulados foram injetados apenas no navegador de teste e não fazem parte da aplicação.

Capturas da consulta real: [mobile](evidencias/375.png), [tablet](evidencias/768.png) e [desktop](evidencias/1200.png). [Resultados da verificação](evidencias/verificacao.json). O compartilhamento nativo depende do suporte do dispositivo; o fluxo de compartilhamento do sistema operacional não foi automatizado.

## Publicação e monetização

Site estático compatível com GitHub Pages. Publique a pasta raiz da branch `feat/preferencias-compartilhamento`, que contém todas as etapas, ou da `main` após integrar as branches.

A interface reserva um espaço publicitário demonstrativo, sem rastreadores ou anúncios ativos. Uma possível monetização futura é patrocínio contextual. Antes de uso comercial, revisar a licença e o plano da API; o endpoint público sem chave não é indicado para cargas de produção. Não colocar chaves privadas no JavaScript.
