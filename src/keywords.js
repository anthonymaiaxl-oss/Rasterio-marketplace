// Lista editorial inicial; não representa ranking de vendas ou demanda.
export const keywordGroups = {
 'Videogames': ['PS5','PS5 Slim','PS4','Xbox Series S','Xbox Series X','Nintendo Switch','Nintendo Switch OLED','Nintendo Switch 2','DualSense','controle Xbox','controle 8BitDo','Steam Deck','jogos PS5'],
 'Eletrônicos': ['smartphone Samsung Galaxy','iPhone','celular Xiaomi','notebook Lenovo','notebook Dell','SSD NVMe 1TB','memória RAM DDR4','placa de vídeo RTX','monitor gamer','smart TV','fone Bluetooth','JBL','roteador Wi-Fi 6','tablet Samsung','smartwatch'],
 'Ferramentas': ['parafusadeira','furadeira de impacto','kit ferramentas','esmerilhadeira','lavadora de alta pressão'],
 'Casa e cozinha': ['air fryer','cafeteira','aspirador robô','liquidificador','panela de pressão elétrica','ventilador'],
 'Acessórios': ['carregador USB-C','power bank','cabo USB-C','mouse sem fio','teclado mecânico','webcam','suporte celular'],
 'Outras categorias': ['bicicleta','capacete moto','caixa de ferramentas','cadeira de escritório','câmera de segurança','kit jardinagem']
};
export function searchLinks(term){const q=encodeURIComponent(term);return [
 ['AliExpress',`https://pt.aliexpress.com/w/wholesale-${encodeURIComponent(term.replaceAll(' ','-'))}.html`],
 ['Shopee',`https://shopee.com.br/search?keyword=${q}`],
 ['OLX',`https://www.olx.com.br/brasil?q=${q}`],
 ['Facebook Marketplace',`https://www.facebook.com/marketplace/search/?query=${q}`]
];}
