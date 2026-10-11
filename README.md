# Rasterio Marketplace

Versão inicial de um marketplace em português, com layout responsivo, catálogo de oito produtos ilustrativos, busca sem distinção de acentos, filtros por categoria e preço, ordenação, detalhes de produto e carrinho persistente em localStorage.

## Desenvolvimento

Requer Node.js 20.19+ ou 22.12+ (validado com Node.js 24) e npm.

```sh
cd /workspace/Rasterio-marketplace
npm ci --cache /tmp/rasterio-npm-cache
npm run dev -- --port 5173
```

## Verificação

```sh
npm test
npm run build
npm run test:e2e
```

Os testes de navegador usam `/usr/bin/chromium`, disponível neste ambiente. Para outro navegador Chromium instalado, defina `CHROMIUM_PATH` com o caminho do executável. Os testes executam o fluxo completo em resoluções de desktop e celular e iniciam o servidor automaticamente.

Para servir a versão de produção: `npm run preview -- --port 4173` após o build.

## Escopo

Aplicação frontend com Vite e JavaScript, sem serviços externos obrigatórios. Os produtos, avaliações e ilustrações são demonstrativos. O frete é estimado em R$ 19,90 e gratuito a partir de R$ 299. O botão de conclusão realiza uma simulação, preserva o carrinho e não envia pedidos ou processa pagamentos. Não há backend, autenticação, estoque ou integração logística. Quantidade limitada a 99 unidades por produto.

O catálogo e as funções de busca e cálculo estão em `src/catalog.js`; a interface e as rotas estão em `src/main.js`; o estilo está em `src/style.css`. As páginas usam rotas por hash para permitir acesso direto sem configuração de servidor.
