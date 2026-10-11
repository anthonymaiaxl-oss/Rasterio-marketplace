import {safeImage,region} from './media.js';
export const defaults = {running:false, minutes:10, terms:['PS5','PS4','Xbox Series S','Nintendo Switch','iPhone 13','celular Samsung Galaxy','notebook Dell','notebook Lenovo','monitor','parafusadeira','furadeira','air fryer','cafeteira','ventilador','bicicleta','cadeira de escritório'], index:0, platformIndex:0, passIndex:0, passes:2, tabs:{}, facebookConfirmed:false,facebookRadius:80};
export const normalize = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
export function priceBR(text){const m=String(text).match(/R\$\s*([\d.]+(?:,\d{2})?)/);return m?Number(m[1].replaceAll('.','').replace(',','.')):null;}
export function sourceFor(url){try{const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password)return null;const h=u.hostname; if(h==='olx.com.br'||h.endsWith('.olx.com.br'))return 'OLX';if(h==='aliexpress.com'||h.endsWith('.aliexpress.com'))return 'AliExpress';if(h==='shopee.com.br'||h==='www.shopee.com.br')return 'Shopee';if(h==='www.facebook.com'&&u.pathname.startsWith('/marketplace/'))return 'Facebook';}catch{}return null;}
export function searchURL(source,term){const q=encodeURIComponent(term);return {OLX:`https://www.olx.com.br/brasil?q=${q}`,AliExpress:`https://pt.aliexpress.com/w/wholesale-${encodeURIComponent(term.replaceAll(' ','-'))}.html`,Shopee:`https://shopee.com.br/search?keyword=${q}`,Facebook:`https://www.facebook.com/marketplace/search/?query=${q}`}[source];}
export function riskFor(text){const t=normalize(text);if(/oxid|queimad|placa.*defeito|defeito.*placa|curto.circuito|dano estrutural|tela quebrada|display quebrado|nao liga|nao testad|retirada de pecas|para pecas|deve ser|talvez|nao sei/.test(t))return 'alto/incerto';if(/defeito|quebrad|trocar|troca de|reparo|avaria|bateria ruim|bateria viciada/.test(t))return 'revisar reparo';return 'sem defeito informado';}
export function median(a){const v=[...a].sort((a,b)=>a-b);return v.length?(v[Math.floor((v.length-1)/2)]+v[Math.floor(v.length/2)])/2:null;}
export function mergeOffers(existing,incoming,now=Date.now()){
 const map=new Map();for(const o of existing){try{const u=new URL(o.url);u.search='';u.hash='';const previous=map.get(u.href);if(!previous||o.lastSeen>=previous.lastSeen)map.set(u.href,{...o,url:u.href,history:[...(o.history||[])]});}catch{}}for(const original of incoming.slice(0,100)){const raw={...original};try{const u=new URL(raw.url);u.search='';u.hash='';raw.url=u.href;}catch{continue;}
  const source=sourceFor(raw.url);if(!source||source!==raw.source||typeof raw.title!=='string'||!raw.title.trim()||!Number.isFinite(raw.price)||raw.price<=0||raw.price>1000000)continue;
  const old=map.get(raw.url);const history=old?.history||[];if(!history.length||history.at(-1).price!==raw.price)history.push({price:raw.price,at:now});
  map.set(raw.url,{...old,url:raw.url,source,title:raw.title.slice(0,300),text:String(raw.text||'').slice(0,1500),price:raw.price,productTag:String(raw.productTag||old?.productTag||'').slice(0,100),image:safeImage(raw.image)||safeImage(old?.image),risk:riskFor(raw.text||raw.title),reviewed:old?.reviewed&&old.title===raw.title.slice(0,300)&&old.text===String(raw.text||'').slice(0,1500),firstSeen:old?.firstSeen||now,lastSeen:now,history:history.slice(-30),regionVerified:source==='Facebook'?Boolean(raw.regionVerified):false});
 }return [...map.values()].sort((a,b)=>b.lastSeen-a.lastSeen).slice(0,2000);
}
export function insights(offers,now=Date.now(),radius=200){
 return offers.filter(o=>o.source!=='Facebook').map(o=>{
 const key=o.model&&o.condition?normalize(o.model)+'|'+o.condition:null;
 const refs=key?offers.filter(r=>r.url!==o.url&&r.reviewed&&r.working&&r.risk!=='alto/incerto'&&r.model&&normalize(r.model)+'|'+r.condition===key&&(r.source!=='Facebook'||r.regionVerified&&region(r,radius).state==='local')&&now-r.lastSeen<7*86400000):[];
 const regional=refs.filter(r=>['Facebook','OLX'].includes(r.source)&&region({...r,source:'Facebook'},radius).state==='local');const pool=regional.length>=3?regional:refs;const values=pool.map(r=>r.price);const typical=values.length>=3?median(values):null;const mean=values.length>=3?values.reduce((a,b)=>a+b,0)/values.length:null;
 const costsKnown=[o.shipping,o.tax,o.repair,o.reserve].every(v=>Number.isFinite(v)&&v>=0);const total=costsKnown?o.price+o.shipping+o.tax+(o.fees||0)+o.repair+o.reserve:null;
 const eligible=o.reviewed&&o.risk!=='alto/incerto'&&(o.working||o.simpleRepair)&&o.delivery&&typical!==null&&total!==null&&now-o.lastSeen<86400000;
 return {...o,typical,mean,samples:values.length,regionalSamples:regional.length,regionalMean:regional.length>=3?regional.reduce((sum,r)=>sum+r.price,0)/regional.length:null,regionalMedian:regional.length>=3?median(regional.map(r=>r.price)):null,referenceBasis:regional.length>=3?'regional':'entre fontes',total,saving:eligible?typical-total:null,drop:o.history?.length>1?o.history[0].price-o.price:0};
 }).sort((a,b)=>(b.saving??-Infinity)-(a.saving??-Infinity)||b.lastSeen-a.lastSeen);
}
export function bestOpportunities(offers,now=Date.now(),radius=80){
 const rows=insights(offers,now,radius);const ready=rows.filter(o=>o.saving>0&&o.total<o.mean).map(o=>({...o,discountPercent:(o.mean-o.total)/o.mean*100})).sort((a,b)=>b.saving-a.saving||b.discountPercent-a.discountPercent);
 const pending=rows.filter(o=>o.saving===null&&o.mean!==null&&o.price<o.mean&&o.price<o.typical&&o.risk!=='alto/incerto'&&now-o.lastSeen<86400000).map(o=>({...o,missing:[...(!o.reviewed?['revisão de modelo/condição']:[]),...(!o.working&&!o.simpleRepair?['funcionamento ou diagnóstico do reparo']:[]),...(!o.delivery?['entrega para seu CEP']:[]),...(o.total===null?['frete, impostos, peça e reserva']:[])]})).sort((a,b)=>(b.mean-b.price)-(a.mean-a.price));
 return {ready,pending,withoutReference:rows.filter(o=>o.mean===null).length};
}
