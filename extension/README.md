# Extensão Rasterio para Chrome

## Instalar no seu computador

1. Baixe/descompacte a pasta `extension` deste repositório.
2. No Chrome, abra `chrome://extensions`, ative **Modo do desenvolvedor** e clique em **Carregar sem compactação**.
3. Selecione a pasta `extension` (a que contém `manifest.json`). Fixe o ícone Rasterio e clique nele para abrir o painel.
4. Configure seu CEP nas lojas. Abra o Facebook Marketplace e configure **Nova Mutum–MT / 200 km**. Só marque a confirmação do painel depois de conferir esse filtro. A extensão não verifica distância nem altera localização automaticamente.
5. Ajuste as buscas, confirme o intervalo (15 minutos por padrão) e ative o rodízio. Cada rodada abre/reutiliza uma aba dedicada por fonte. Facebook só participa após a confirmação regional; nunca aparece como oportunidade de compra.
6. Revise os anúncios: modelo/configuração, condição, funcionamento, entrega e todos os custos. Informe zero apenas quando confirmado. Marque reparo simples apenas depois de conferir diagnóstico, disponibilidade da peça e custo.

## O que funciona

Chrome Manifest V3, armazenamento local, rodízio persistente, coleta de cartões carregados, deduplicação por URL e histórico de mudanças de preço. Inspeção inicial após 5 segundos e depois a cada 2 minutos, somente nas abas dedicadas enquanto o acompanhamento está ativo. Pausar o rodízio também pausa a aceitação de dados. Não fecha abas do usuário.

Média e mediana exigem três outros anúncios equivalentes revisados e funcionando, vistos nos últimos sete dias. A oferta não entra na própria referência. O ranking exige observação nas últimas 24 horas, entrega confirmada, custos preenchidos e revisão. A economia é mediana menos preço, frete, impostos/taxas, reparo e reserva; não é lucro garantido. Facebook entra apenas como referência com região confirmada. Preços são preços pedidos, não vendas realizadas. Mudanças na descrição invalidam a revisão.

## Limites

Esta é a primeira versão, com extratores conservadores: cartões com vários preços, parcelas ou variantes são ignorados para evitar pegar o preço errado. Títulos, estado, especificações, frete e impostos não são certificados automaticamente. Descrição de cartão não revela todos os defeitos; a classificação é uma triagem por palavras, não diagnóstico técnico. Ausência de menção a defeito não comprova funcionamento. A coleta não certifica que um anúncio ainda está disponível.

Sites podem mudar seu HTML, exigir login/CAPTCHA ou recusar automação. Navegador fechado, abas suspensas e carregamento incompleto interrompem a coleta. Não há rolagem automática, coleta de cookies/senhas, login automático nem contorno de bloqueios. O rodízio troca a pesquisa nas abas dedicadas; mova uma aba para outro site para ela deixar de ser reutilizada.

O painel da extensão é independente do painel web atual. A exportação `rasterio-extension-v1` contém o histórico bruto/revisões; não é o formato de importação do painel web. Dados ficam neste perfil do Chrome, limitados a 2.000 anúncios e 30 mudanças por anúncio. Exporte antes de remover a extensão. As buscas cobrem categorias escolhidas, não todo o catálogo dos sites.

Validação automatizada cobre análise, persistência e rodízio com APIs do Chrome simuladas, além do extrator real em uma página de teste. O teste com a extensão carregada não pôde executar na nuvem: a política do Chromium bloqueia instalação de extensões. Coleta real em sua sessão do Chrome precisa ser conferida em cada plataforma após instalar.

## Atualizar para 0.1.1

Baixe novamente a mesma branch e substitua os arquivos na pasta `extension` que já foi carregada no Chrome. Em `chrome://extensions`, clique no botão de recarregar do Rasterio; não remova a extensão, para preservar os dados locais. Feche o painel antigo e abra novamente pelo ícone. Ative/salve o acompanhamento e clique em **Rodar agora**. O painel exibe a última rodada, a próxima prevista e erros por fonte. Alarmes ausentes são recriados quando o serviço/painel reinicia; falhas em uma aba não interrompem as demais fontes. Chrome pode atrasar alarmes enquanto o computador dorme.

## Dashboard visual — versão 0.2.0

Após atualizar os arquivos da mesma pasta e recarregar a extensão em `chrome://extensions`, o ícone Rasterio abre o novo dashboard. A tela anterior continua em **Acompanhamento e revisão**.

Clique em **Importar histórico** e escolha seu `rasterio-historico.json`. Importações são validadas antes de salvar, preservam datas e reúnem URLs repetidas. O arquivo do usuário não acompanha o repositório. Os cartões têm filtros por fonte/categoria, preços, gráfico das mudanças observadas e links para os anúncios. Média/mediana e economia continuam exigindo revisão de equivalência e custos na tela de acompanhamento; agrupar por categoria não prova equivalência.

Históricos antigos não têm fotos. Use **+ Foto / print** em cada cartão (PNG/JPEG/WebP até 1 MB). As próximas coletas incluem a imagem carregada no cartão quando disponível. URLs de imagens são restritas a HTTPS de CDNs conhecidas; se faltarem ou expirarem, aparece uma ilustração identificada como sem foto. Imagens externas são carregadas do CDN quando você abre o dashboard. Fotos locais ficam no armazenamento do Chrome e acompanham a exportação.

Referências do Facebook com cidades reconhecidas a mais de 200 km ou cidade desconhecida não entram na mediana. Distâncias usam centros urbanos em linha reta, não rodovias nem endereço do vendedor. A lista inicial reconhece Nova Mutum, Lucas do Rio Verde, Sorriso, Sinop, Cuiabá, Diamantino, Nobres, Vera e Várzea Grande; outras cidades precisam de confirmação fora desta primeira versão. O filtro regional da plataforma continua sendo configuração manual.

Validação do dashboard com Chrome APIs simuladas: `node scripts/test-gallery.mjs`. Opcionalmente defina `HISTORY_PATH` apontando para uma exportação local para verificar seus registros; o teste não publica esses dados.

## Coleta atualizada — versão 0.2.1

O coletor aceita links de produto entre subdomínios do AliExpress e lê valores divididos em elementos do cartão. Em AliExpress e Shopee, tenta primeiro o elemento de preço atual; valores antigos riscados são ignorados. Preços ambíguos e parcelas sem preço total continuam sendo rejeitados. Páginas com verificação/CAPTCHA são sinalizadas, sem contorno. O dashboard mostra, por fonte, o número de itens da última leitura, ausência de links de produto ou preços não identificados com segurança.

Depois de substituir os arquivos e recarregar a extensão, abra o painel **Acompanhamento e revisão** e clique em **Rodar agora** para recarregar as abas com o novo coletor. Aguarde o carregamento e confira o status no dashboard visual. Fechar/reabrir ou atualizar as abas existentes também é necessário para que recebam o novo script.

## Coleta por link — versão 0.2.2

Cole o link de um anúncio no campo do dashboard visual e clique em **Coletar este anúncio**. A extensão abre uma aba para capturar somente esse link durante 20 minutos, mesmo com o rodízio pausado. Links de busca e destinos fora dos marketplaces configurados são rejeitados. Faça login/verificação no próprio site quando solicitado. O coletor tenta identificar título, preço atual, cidade e imagem carregada; não coleta mensagens nem credenciais. Elementos com preço riscado por CSS também são ignorados. Páginas cujo título/preço não puderem ser identificados precisam de validação manual. Facebook continua sendo apenas referência de preço.

## Raio local configurável — versão 0.2.3

Em **Acompanhamento e revisão**, escolha **Raio local do Facebook (km)**; o padrão agora é 80 km. Configure o mesmo raio na própria página do Marketplace, marque a confirmação e salve. O dashboard recalcula as referências já coletadas pelo raio escolhido; anúncios fora dele continuam guardados, mas ficam fora da referência local. O raio usa distância em linha reta a partir de centros urbanos conhecidos, não distância rodoviária.

Para mudar o raio durante o acompanhamento: pause, ajuste a localização/raio no Facebook, ajuste o campo da extensão, confirme, salve e retome. Para duas instâncias independentes, use dois perfis do Chrome com a extensão carregada em cada um. Configurações e histórico são separados por perfil; confira o raio no próprio Facebook, que pode conservar preferências da conta. Instalar a mesma extensão duas vezes no mesmo perfil não cria instâncias independentes.

## Importação, produtos e ciclo diário — versão 0.3.0

**Importar histórico** aceita vários arquivos JSON selecionados juntos, até 10 MB no conjunto: exportação `rasterio-extension-v1`, lista do painel web, lista simples ou objeto com `offers`, `items` ou `anuncios`. Campos reconhecidos incluem `url/link`, `title/titulo/product`, `price/preco`, `observedAt/observadoEm/lastSeen`, `model/modelo`, `condition/condicao`, `city/cidade`, custos e confirmações explícitas. Datas de observação são obrigatórias; o importador não inventa consulta recente ou funcionamento. Preços como `R$ 1.999,90` são aceitos. Campo desconhecido não é usado nos cálculos. Se qualquer arquivo for inválido, o conjunto não é salvo.

URLs repetidas (sem parâmetros de rastreamento) são reunidas, com histórico de até 30 observações por anúncio e dados complementares de custos/modelo. A base combinada tem limite de 2.000 anúncios; se exceder, a importação é rejeitada sem apagar dados. Os cartões mostram média, mediana e quantidade de referências revisadas. Três referências regionais equivalentes de Facebook/OLX no raio escolhido têm prioridade; sem três locais, a comparação entre fontes é identificada explicitamente. Taxas de compra importadas também entram no custo.

O filtro **Produto / busca** funciona com o termo registrado nas novas coletas e com famílias inferidas pelos títulos antigos; inferir família não comprova equivalência de modelo. O filtro é independente das categorias. Em **Acompanhamento e revisão**, clique em **Restaurar lista de produtos**, confira os 16 termos, ajuste passagens e salve. Isso também sugere intervalo de 10 minutos e duas passagens. A lista salva anteriormente é preservada até você alterá-la.

Cada rodada abre/reutiliza somente uma plataforma. O ciclo percorre todos os termos em todas as fontes habilitadas e repete pelo número de passagens definido (1–5). Com 16 termos, quatro fontes e duas passagens a cada 10 minutos, há 128 rodadas em aproximadamente 21h20. O painel informa duração e combinações visitadas hoje. O cursor é preservado para retomar, mesmo se o Chrome fechar. Chrome aberto, computador acordado, login e páginas funcionando são necessários; visita não garante anúncio coletado nem cobertura total. Configurações que excedem 24 horas mostram aviso de duração. Facebook só participa após a confirmação manual de localização/raio.

## Melhores oportunidades — versão 0.3.1

Abra **Melhores oportunidades** no menu do dashboard. A aba lista compras em OLX, Shopee e AliExpress com custo total abaixo da média e da mediana do mesmo modelo/configuração e condição, com pelo menos três referências revisadas e recentes. Facebook permanece somente como referência. A oferta de compra não entra na própria média. Três referências regionais no raio configurado têm prioridade; caso contrário, a origem é indicada como comparação entre fontes.

A ordem padrão usa a maior diferença entre mediana e custo total (preço + frete + impostos + taxas de compra + reparo + reserva). O cartão mostra porcentagem abaixo da média, média/mediana e quantidade de referências. A diferença ainda não desconta taxas sobre a venda, negociação e outros custos de venda: não é lucro garantido. Defeitos de alto risco/incertos não entram. Em **Preços baixos a revisar**, aparecem anúncios abaixo da referência, mas com funcionamento, entrega, revisão ou custos pendentes. Sem modelo/condição e três referências equivalentes revisadas, não se inventa uma oportunidade; a tela orienta completar os dados em **Acompanhamento e revisão**.

## Memória — versão 0.3.2

O loop reutiliza uma única aba automática entre plataformas. Ao migrar, abas extras registradas pelo loop são fechadas somente se estiverem em segundo plano e ainda na plataforma esperada; abas abertas por você e abas desviadas para outros sites são preservadas. Captura explícita por link abre uma aba separada para revisão; feche-a quando terminar. O coletor consulta autorização antes de ler o DOM, não varre páginas comuns/pausadas e não mantém observador de mutações. Faz leituras iniciais aos 5, 20 e 60 segundos e depois a cada três minutos, limitando a inspeção a 600 links e até 100 anúncios por leitura. O dashboard mostra 24 cartões por página com imagens sob demanda. O consumo total de RAM depende do site e do Chrome; não há teto de memória imposto pela extensão.

Com 16 termos e quatro plataformas há 64 combinações por passagem; duas passagens são 128 rodadas, aproximadamente 21h20 a cada 10 minutos. Chrome ativo por 24 horas permite aproximadamente 144 rodadas. Volume não é garantido: 25 anúncios carregados por busca dariam até cerca de 1.600 registros por passagem antes de duplicados, falhas e limite de armazenamento (2.000 anúncios). Repetir a passagem atualiza preços/histórico; não multiplica automaticamente anúncios únicos.

## Repetidos — versão 0.3.3

A coleta reúne URLs do mesmo anúncio sem parâmetros de rastreamento. Reencontrar o mesmo anúncio com o mesmo preço atualiza a data da consulta, sem adicionar cartão nem observação de preço repetida. Uma mudança de preço acrescenta histórico. Navegação automática por páginas de resultados e abertura sequencial de detalhes ainda não estão implementadas nesta versão.

## Avanço de resultados — versão 0.4.0

O loop tenta avançar a próxima página na mesma aba: controles reconhecidos de próximo/next ou link `rel=next`. O Facebook pode carregar mais resultados com uma rolagem limitada. Configure **Páginas / carregamentos por rodada**, de 1 a 5, padrão 3 (inclui a primeira página). Há pelo menos um minuto entre avanços; depois de cada mudança, o coletor aguarda carregamento e lê novamente. No Facebook, itens já lidos naquele carregamento são pulados após a rolagem; entre rodadas, URLs repetidas continuam sendo reunidas para atualizar preço/histórico. Não abre anúncios individualmente.

O avanço é autorizado somente na aba automática ativa do loop e na mesma busca/plataforma. Não ocorre em capturas manuais de detalhes, no acompanhamento pausado, em páginas sem produtos coletados ou com verificação/CAPTCHA. Destinos externos e alteração do termo/caminho são rejeitados. O limite permanece no serviço mesmo se o coletor reiniciar. Layouts cujo controle não seja reconhecido podem permanecer na primeira página; coleta real precisa ser conferida na sessão do usuário. Teste DOM do botão de próxima página: `node scripts/test-pagination.mjs`.

Os primeiros anúncios podem aparecer após a leitura inicial, entre cerca de 30 segundos e dois minutos se o site carregar e o extrator reconhecer os cartões. Três páginas/carregamentos levam aproximadamente dois a três minutos dentro de uma rodada de dez minutos. Para um teste curto, escolha um ou dois termos, uma passagem e intervalo de dez minutos: com quatro fontes, são cerca de 40 ou 80 minutos para um ciclo. O ranking de oportunidades requer também revisão do modelo/condição e três referências equivalentes, além dos custos; coleta sozinha não garante oportunidades calculáveis.

### 0.4.2
Verificação de rodadas vencidas a cada minuto, retomada sem reiniciar a espera no início do Chrome e restauração do agendamento após Rodar agora. Computador suspenso pode atrasar alarmes; a retomada ocorre quando o Chrome volta a executar.

## 0.5.0 — análise automática e revenda

As seções anteriores registram o histórico das versões. Nesta versão, a revisão manual não é pré-requisito do ranking. Modelos reconhecidos no título (consoles, iPhone, Galaxy e alguns códigos de fabricantes) ou informados na revisão são comparados por versão, capacidade, condição e tipo. Atributos ausentes permanecem desconhecidos; não se misturam com atributos conhecidos. Kits e acessórios ficam separados e não entram no ranking de produtos. Identificação textual é limitada e pode exigir correção em anúncios ambíguos.

Nova Mutum / 80 km é a prioridade padrão. Havendo três referências locais equivalentes, a média e a mediana usam essa amostra; senão, a origem aparece como entre fontes. Facebook participa só como referência regional, nunca como compra. A oferta analisada é excluída de sua própria referência. Referências têm até sete dias; ofertas do ranking, até um dia. Preços são pedidos, não transações comprovadas.

Revenda provável = mediana × (1 − negociação de venda). Custo total = preço × (1 − negociação de compra) + frete + impostos + reparo + reserva + taxas de compra. Lucro = revenda provável × (1 − taxa de venda) − custo total. Retorno = lucro / custo total. Compra máxima negociada = máximo entre zero e [receita líquida / (1 + retorno desejado) − custos adicionais]. Valores monetários são arredondados a centavos.

Custos confirmados na revisão prevalecem sobre o cenário global; os ausentes usam as hipóteses ajustáveis do cenário. O cartão identifica custos assumidos. Confiança descreve a cobertura de referências e atributos; não é probabilidade de venda ou de funcionamento. Confirme frete, entrega, tributos e funcionamento antes de negociar. O simulador permite sobrescrever os custos de cada anúncio, sem modificar a coleta.

Registre as revendas com datas e valores efetivos para medir lucro realizado e dias entre compra e venda. Não estimamos demanda ou prazo usando volume de anúncios. Backup completo guarda histórico, fotos, configurações, cenários e revendas. A restauração reúne anúncios e revendas sem apagar os atuais; mantém configurações existentes. Em navegador novo, restaura buscas com rodízio pausado, sem importar IDs antigos de abas. A atualização mantém as chaves de armazenamento e o loop econômico com uma aba automática. Para manter dados ao reinstalar, use a mesma pasta e Recarregar na extensão existente; exporte backup antes de remover a instalação.

### Instalar 0.5.0
Descompacte `rasterio-chrome-0.5.0.zip`, abra `chrome://extensions` e carregue a pasta que contém `manifest.json`. Para atualizar, substitua os arquivos na pasta já usada e clique em Recarregar. Padrões atuais: intervalo de 10 minutos, duas passagens, até três páginas por rodada e uma aba automática.
