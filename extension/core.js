export const defaults = {running:false, minutes:15, terms:['PS5','iPhone 13','notebook Dell','parafusadeira','air fryer','bicicleta'], index:0, tabs:{}, facebookConfirmed:false};
export const normalize = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
export function priceBR(text){const m=String(text).match(/R\$\s*([\d.]+(?:,\d{2})?)/);return m?Number(m[1].replaceAll('.','').replace(',','.')):null;}
export function sourceFor(url){try{const u=new URL(url);if(u.protocol!=='https:')return null;const h=u.hostname; if(h==='olx.com.br'||h.endsWith('.olx.com.br'))return 'OLX';if(h==='aliexpress.com'||h.endsWith('.aliexpress.com'))return 'AliExpress';if(h==='shopee.com.br'||h==='www.shopee.com.br')return 'Shopee';if(h==='www.facebook.com'&&u.pathname.startsWith('/marketplace/'))return 'Facebook';}catch{}return null;}
export function searchURL(source,term){const q=encodeURIComponent(term);return {OLX:`https://www.olx.com.br/brasil?q=${q}`,AliExpress:`https://pt.aliexpress.com/w/wholesale-${encodeURIComponent(term.replaceAll(' ','-'))}.html`,Shopee:`https://shopee.com.br/search?keyword=${q}`,Facebook:`https://www.facebook.com/marketplace/search/?query=${q}`}[source];}
export function riskFor(text){const t=normalize(text);if(/oxid|queimad|placa.*defeito|defeito.*placa|curto.circuito|dano estrutural|tela quebrada|display quebrado|nao liga|nao testad|retirada de pecas|para pecas|deve ser|talvez|nao sei/.test(t))return 'alto/incerto';if(/defeito|quebrad|trocar|troca de|reparo|avaria|bateria ruim|bateria viciada/.test(t))return 'revisar reparo';return 'sem defeito informado';}
export function median(a){const v=[...a].sort((a,b)=>a-b);return v.length?(v[Math.floor((v.length-1)/2)]+v[Math.floor(v.length/2)])/2:null;}
export function mergeOffers(existing,incoming,now=Date.now()){
 const map=new Map(existing.map(o=>[o.url,o]));for(const raw of incoming.slice(0,100)){
  const source=sourceFor(raw.url);if(!source||source!==raw.source||typeof raw.title!=='string'||!raw.title.trim()||!Number.isFinite(raw.price)||raw.price<=0||raw.price>1000000)continue;
  const old=map.get(raw.url);const history=old?.history||[];if(!history.length||history.at(-1).price!==raw.price)history.push({price:raw.price,at:now});
  map.set(raw.url,{...old,url:raw.url,source,title:raw.title.slice(0,300),text:String(raw.text||'').slice(0,1500),price:raw.price,risk:riskFor(raw.text||raw.title),reviewed:old?.reviewed&&old.title===raw.title.slice(0,300)&&old.text===String(raw.text||'').slice(0,1500),firstSeen:old?.firstSeen||now,lastSeen:now,history:history.slice(-30),regionVerified:source==='Facebook'?Boolean(raw.regionVerified):false});
 }return [...map.values()].sort((a,b)=>b.lastSeen-a.lastSeen).slice(0,2000);
}
export function insights(offers,now=Date.now()){
 return offers.filter(o=>o.source!=='Facebook').map(o=>{
 const key=o.model&&o.condition?normalize(o.model)+'|'+o.condition:null;
 const refs=key?offers.filter(r=>r.url!==o.url&&r.reviewed&&r.working&&r.risk!=='alto/incerto'&&r.model&&normalize(r.model)+'|'+r.condition===key&&(r.source!=='Facebook'||r.regionVerified)&&now-r.lastSeen<7*86400000):[];
 const values=refs.map(r=>r.price);const typical=values.length>=3?median(values):null;const mean=values.length>=3?values.reduce((a,b)=>a+b,0)/values.length:null;
 const costsKnown=[o.shipping,o.tax,o.repair,o.reserve].every(v=>Number.isFinite(v)&&v>=0);const total=costsKnown?o.price+o.shipping+o.tax+o.repair+o.reserve:null;
 const eligible=o.reviewed&&o.risk!=='alto/incerto'&&(o.working||o.simpleRepair)&&o.delivery&&typical!==null&&total!==null&&now-o.lastSeen<86400000;
 return {...o,typical,mean,samples:values.length,total,saving:eligible?typical-total:null,drop:o.history?.length>1?o.history[0].price-o.price:0};
 }).sort((a,b)=>(b.saving??-Infinity)-(a.saving??-Infinity)||b.lastSeen-a.lastSeen);
}
