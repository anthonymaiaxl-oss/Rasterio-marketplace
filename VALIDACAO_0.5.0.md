# Validação 0.5.0

Reconstruída a partir de dbb8ecb na branch rasterio-chrome-extension. Commit 5de9c0d e ZIP da sessão anterior não estavam disponíveis.

- 38 testes unitários passaram, incluindo cálculo de lucro, negociação, ROI, preço máximo, referência regional, separação de configurações, risco e datas de vendas.
- Dashboard testado em Chromium com API storage simulada: importação, deduplicação, filtros de preço, persistência, desktop/celular sem overflow, ranking automático, simulador e revenda registrada.
- Coletor e paginação: testes DOM passaram. Testes do serviço verificam persistência, watchdog, agendamento e rodízio com uma aba.
- Build Vite passou; módulos da extensão passam na conferência sintática; ZIP íntegro e manifest 0.5.0 na raiz.
- Inspeção visual desktop/celular realizada.
- O teste de carregamento da extensão completa no Chromium do sistema não obteve evento de service worker no prazo. Não se declara esse teste concluído; dashboard, coletor e serviço foram verificados separadamente. Coleta real em contas autenticadas nas plataformas não foi executada nesta sessão.

Limitações: identificação por texto conservadora, atributos não informados sem inferência, preços pedidos usados como referência (não vendas), custos ausentes como hipóteses explícitas. Prazo e lucro realizado apenas a partir de registros de revendas. Comparáveis insuficientes não geram valor de revenda. Kits e acessórios não entram no ranking de produtos.

O ZIP fica versionado em downloads para acesso no GitHub sem depender dos artefatos do chat. Atualização mantém o armazenamento existente; exporte backup completo antes de remover uma extensão instalada.
