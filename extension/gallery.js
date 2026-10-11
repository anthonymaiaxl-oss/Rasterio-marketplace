import {sourceFor,normalize,mergeOffers} from './core.js';
import {safeImage} from './media.js';
export {safeImage,region} from './media.js';
export function category(o){const t=normalize(o.title);if(/^(?:vende[ -]se |vendo )?(?:controle|dualsense|dock|suporte|base|estacao|carregador)|volante|shifter|cambio logitech/.test(t))return 'Acessórios gamer';if(/ps[345]|playstation|xbox|nintendo|console|steam deck/.test(t))return 'Consoles';if(/bicicleta|bike|aro \d/.test(t))return 'Bicicletas';if(/notebook|laptop|computador|pc gamer/.test(t))return 'Computadores';if(/iphone|celular|galaxy|xiaomi|smartphone/.test(t))return 'Celulares';if(/furadeira|parafusadeira|ferramenta|esmerilhadeira/.test(t))return 'Ferramentas';if(/air.?fryer|fritadeira|chuveiro|aquecedor|cafeteira|geladeira|ventilador/.test(t))return 'Casa';return 'Outros';}
function numberValue(v){if(typeof v==='number')return v;if(typeof v!=='string'||!v.trim())return undefined;let t=v.trim().replace(/^R\$\s*/,'').replace(/\s/g,'');if(!/^(?:\d+(?:[.,]\d+)*|0)$/.test(t))return NaN;if(t.includes(','))t=t.replaceAll('.','').replace(',','.');else if(/^\d{1,3}(?:\.\d{3})+$/.test(t))t=t.replaceAll('.','');return Number(t);}
function normalizeRecord(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Registro inválido.');
 const u=new URL(raw.url??raw.link);const source=sourceFor(u.href);if(!source)throw Error('Link fora das plataformas configuradas.');u.search='';u.hash='';
 const declared=raw.source??raw.fonte;if(declared&&declared!=='Facebook Marketplace'&&declared!==source)throw Error('Fonte e domínio não correspondem.');if(declared==='Facebook Marketplace'&&source!=='Facebook')throw Error('Fonte e domínio não correspondem.');
 const title=raw.title??raw.titulo??raw.product;const text=raw.text??raw.description??raw.descricao??raw.notes??'';const city=raw.city??raw.cidade??'';
 const price=numberValue(raw.price??raw.preco);const date=raw.lastSeen??raw.observedAt??raw.observadoEm;const at=typeof date==='number'?date:Date.parse(date);const first=raw.firstSeen??at;
 const history=raw.history??[{price,at}];
 const c={confirmationsProvided:['reviewed','working','simpleRepair','delivery'].filter(k=>raw[k]!==undefined),url:u.href,source,title,productTag:String(raw.productTag??raw.searchTerm??raw.product??'').slice(0,100),text:String(text).slice(0,1200)+(city?' · '+String(city).slice(0,150):''),price,firstSeen:first,lastSeen:at,history,regionVerified:raw.regionVerified===true||source==='Facebook'&&declared==='Facebook Marketplace',image:safeImage(raw.image??raw.imagem)};
 if(typeof raw.model==='string'||typeof raw.modelo==='string')c.model=String(raw.model??raw.modelo).trim().slice(0,150);
 const condition=raw.condition??raw.condicao;c.condition=condition==='novo'?'Novo':condition==='usado'?'Usado':condition;
 for(const [key,alias] of [['shipping','frete'],['tax','impostos'],['repair','reparo'],['reserve','reserva'],['fees','taxas']]){const v=raw[key]??raw[alias];if(v!==undefined)c[key]=numberValue(v);}
 for(const key of ['reviewed','working','simpleRepair','delivery'])if(raw[key]!==undefined)c[key]=raw[key];
 return c;
}
export function recordsFromJSON(data){let list;if(Array.isArray(data))list=data;else if(data&&typeof data==='object'){if(data.format&&data.format!=='rasterio-extension-v1')throw Error('Formato declarado não reconhecido.');list=data.offers??data.items??data.anuncios;}if(!Array.isArray(list)||list.length>2000)throw Error('Use uma lista JSON ou um objeto com offers, items ou anuncios, com até 2.000 registros.');return list.map((raw,index)=>{try{return normalizeRecord(raw);}catch(e){throw Error('Registro '+(index+1)+': '+e.message);}});}
export function importHistory(data,existing=[]){
 const rows=recordsFromJSON(data);const clean=rows.map((o,index)=>{
 if(typeof o.title!=='string'||!o.title.trim()||o.title.length>300||!Number.isFinite(o.price)||o.price<=0||o.price>1000000||![o.firstSeen,o.lastSeen].every(v=>Number.isFinite(v)&&v>0&&v<=Date.now()+86400000)||!Array.isArray(o.history)||o.history.length>30||o.history.some(h=>!Number.isFinite(h.price)||h.price<=0||h.price>1000000||!Number.isFinite(h.at)||h.at<=0||h.at>Date.now()+86400000))throw Error('O arquivo contém um anúncio inválido no registro '+(index+1)+'. Nenhum item foi importado.');
 for(const k of ['shipping','tax','repair','reserve','fees'])if(o[k]!==undefined&&(!Number.isFinite(o[k])||o[k]<0||o[k]>1000000))throw Error('Custo inválido no registro '+(index+1)+': '+k);
 for(const k of ['reviewed','working','simpleRepair','delivery'])if(o[k]!==undefined&&typeof o[k]!=='boolean')throw Error('Confirmação inválida no registro '+(index+1)+': '+k);
 return {...o,title:o.title.trim(),history:o.history.map(h=>({price:h.price,at:h.at})).sort((a,b)=>a.at-b.at),reviewed:o.reviewed===true,working:o.working===true,simpleRepair:o.simpleRepair===true,delivery:o.delivery===true};
 });
 const old=new Map(existing.map(o=>[o.url,o]));for(const o of clean){const previous=old.get(o.url);const latest=!previous||o.lastSeen>=previous.lastSeen?o:previous;const other=latest===o?previous:o;const history=[...(previous?.history||[]),...o.history];const unique=new Map(history.map(h=>[h.at+':'+h.price,h]));const merged=mergeOffers([], [latest],latest.lastSeen)[0];const result={...other,...merged,...latest,image:latest.image||safeImage(other?.image),firstSeen:Math.min(o.firstSeen,previous?.firstSeen??Infinity),history:[...unique.values()].sort((a,b)=>a.at-b.at).slice(-30),risk:merged.risk};
 if(latest===o&&previous&&o.title===previous.title&&o.text===previous.text){for(const k of ['reviewed','working','simpleRepair','delivery'])if(!o.confirmationsProvided.includes(k)&&previous[k]!==undefined)result[k]=previous[k];}delete result.confirmationsProvided;
 // A newer raw capture must not carry an old review across changed descriptions.
 if(other&&(latest.title!==other.title||latest.text!==other.text))result.reviewed=latest.reviewed;
 for(const k of ['model','condition','shipping','tax','fees','repair','reserve'])if(result[k]===undefined&&other?.[k]!==undefined)result[k]=other[k];old.set(o.url,result);}
 const result=[...old.values()].sort((a,b)=>b.lastSeen-a.lastSeen);if(result.length>2000)throw Error('A base combinada excede 2.000 anúncios. Exporte e reduza a base antes de importar.');return result;
}
export function chartCounts(offers){return Object.entries(offers.reduce((out,o)=>{const c=category(o);out[c]=(out[c]||0)+1;return out;},{})).sort((a,b)=>b[1]-a[1]);}
export function productLabel(o){if(o.productTag)return o.productTag;if(o.model)return o.model;const t=normalize(o.title);for(const [pattern,label] of [[/ps5|playstation\s*5/,'PS5'],[/ps4|playstation\s*4/,'PS4'],[/xbox/,'Xbox'],[/nintendo|switch/,'Nintendo Switch'],[/iphone\s*13/,'iPhone 13'],[/iphone/,'iPhone'],[/notebook|laptop/,'Notebook'],[/bicicleta|bike/,'Bicicleta'],[/parafusadeira/,'Parafusadeira'],[/furadeira/,'Furadeira'],[/air.?fryer|fritadeira/,'Air fryer']])if(pattern.test(t))return label;return category(o);}
