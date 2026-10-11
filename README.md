# Rasterio — Radar de revenda

Painel em português para comparar oportunidades em Nova Mutum (MT) e raio padrão de 200 km. Substitui a antiga loja demonstrativa por uma ferramenta de análise.

## Executar

Requer Node.js 20.19+ ou 22.12+ (validado com 24) e npm.

```sh
npm ci --cache /tmp/rasterio-npm-cache
npm run dev -- --port 5173
```

No Windows, use `npm ci` sem a opção de cache. Abra o endereço local informado pelo Vite. Nenhum banco de dados ou Docker é necessário.

## Testar

```sh
npm test
npm run build
npm run test:e2e
```

Os testes de navegador usam `/usr/bin/chromium` no ambiente de nuvem; em outro sistema, defina `CHROMIUM_PATH` com o caminho do executável Chromium/Chrome instalado. São exercitados o radar, filtros, comparação, cadastro persistente e importação em desktop e celular.

## Dados e limites

Não há coleta automática do Facebook, AliExpress, Shopee ou OLX. A tela inicial apresenta exemplos fictícios claramente identificados. Clique em **Usar meus anúncios**, **Adicionar anúncio** ou **Importar JSON** para trabalhar com anúncios consultados por você. A importação é atômica: qualquer item inválido rejeita todo o arquivo. Baixe o modelo JSON no painel. A importação acrescenta os registros e cria IDs novos; evite importar o mesmo arquivo repetidamente.

Dados são salvos no localStorage deste navegador; não são sincronizados. Exporte antes de mudar de computador. URLs devem usar HTTPS e o domínio da fonte selecionada. Não importe informações pessoais dos vendedores.

O raio é distância em linha reta, calculada por Haversine, com coordenadas aproximadas dos centros urbanos — não quilômetros rodoviários. Cadastre coordenadas específicas para anúncios fora das cidades predefinidas. Facebook e OLX dentro do raio fornecem referências locais. OLX fora do raio entra como compra quando há envio informado. AliExpress e Shopee entram quando há entrega informada.

A comparação usa o mesmo texto de modelo/configuração e a mesma condição, ignorando apenas acentos e caixa. Cabe ao usuário conferir autenticidade, especificações e equivalência. A referência é a mediana dos preços pedidos, não valores de vendas concluídas. Cada oferta de compra é excluída da própria referência. Sem outros anúncios comparáveis, o lucro é indeterminado.

**Custo de compra** = preço promocional + frete/retirada + impostos + taxas de compra.

**Lucro estimado** = mediana local comparável × (1 − taxa sobre venda / 100) − custo de compra − custos extras por revenda.

**Retorno** = lucro estimado / custo de compra × 100.

Informe valores finais do checkout para seu CEP. Cupons podem ser restritos a novos compradores. Os impostos são informados, não calculados automaticamente por regras fiscais. OLX com envio e Garantia da OLX significa que o usuário informou essas condições; o painel não as certifica. Confira os termos na plataforma. Datas antigas são sinalizadas para reconfirmação. Quantidade de anúncios não comprova demanda. Nenhum lucro ou prazo de venda é garantido.

## Integração futura

O rastreamento automático permanece pendente de uma fonte de dados autorizada/acessível, documentação da integração e validação de cobertura regional. Esta versão não pede senha do Facebook, não automatiza login e não contorna restrições das plataformas. Não há credenciais ou serviços externos obrigatórios para o fluxo de cadastro/importação.

## Revenda local e palavras-chave

Destino informado: CEP **78450-080**, Nova Mutum (MT). Configure esse CEP no checkout das plataformas; os links de busca não configuram frete ou disponibilidade automaticamente.

O painel traz uma lista editorial de palavras-chave em `src/keywords.js`, com videogames e eletrônicos em destaque, além de ferramentas, casa, acessórios e outras categorias. Não é um ranking de vendas. Cada palavra abre buscas em AliExpress, Shopee, OLX e Facebook. Os resultados não são coletados automaticamente.

Ofertas online podem ser comparadas sem nenhum anúncio local. Informe **Seu preço de revenda deste modelo** em cada cartão; a meta é salva por modelo e condição neste navegador. Sem meta, a referência local continua opcional. Sem ambas, o painel mostra o custo de compra e o lucro indeterminado. A meta é uma hipótese do usuário, não um preço de venda comprovado. O lucro desconta taxas de venda e custos extras configurados.
