import {normalize,median,riskFor} from './core.js';
import {region} from './media.js';
export const scenarioDefaults={buyDiscount:0,sellDiscount:10,shipping:0,tax:0,repair:0,reserve:50,fees:0,saleFee:5,targetROI:20};
const round=n=>Math.round((n+Number.EPSILON)*100)/100;
export function scenario(values={}){const s={...scenarioDefaults,...values};for(const k of Object.keys(scenarioDefaults)){if(!Number.isFinite(s[k])||s[k]<0||s[k]>(['buyDiscount','sellDiscount','saleFee'].includes(k)?99: k==='targetROI'?1000:1000000))throw Error('Cenário inválido: '+k);}return s;}
export function identify(o){
 const title=normalize(o.title||''),text=normalize((o.title||'')+' '+(o.text||''));
 const accessory=/^(?:vendo |vende-se )?(?:controle|dualsense|capa|pelicula|carregador|suporte|dock|base|cabo|bateria|peca|tela para|fonte|case)\b/.test(title)||/\b(?:somente|apenas) (?:controle|pecas|caixa)\b/.test(title);
 const kind=accessory?'acessório':/\bkit\b|\bcombo\b|\blote\b|\bcom \d+ (?:jogos|controles)\b/.test(title)?'kit':'produto';
 let model=o.model?normalize(o.model):'';
 if(!model){const patterns=[/\b(?:ps\s*[345]|playstation\s*[345])\b/,/\bxbox\s+(?:series\s*[sx]|one(?:\s*[sx])?|360)\b/,/\bnintendo\s+switch\b|\bswitch\s+(?:oled|lite)\b/,/\biphone\s*\d{1,2}(?:\s*(?:pro max|pro|plus|mini))?\b/,/\b(?:galaxy\s*[as]\d{1,3}(?:\s*(?:ultra|plus|fe))?)\b/];model=patterns.map(p=>title.match(p)?.[0]).find(Boolean)||title.match(/\b(?:dell|lenovo|acer|asus|hp|bosch|makita|dewalt|philco|mondial|samsung|lg)\s+[a-z0-9-]*\d[a-z0-9-]*\b/)?.[0]||'';}
 model=model.replace(/playstation\s*/g,'ps').replace(/ps\s+([345])/g,'ps$1').replace(/^switch /,'nintendo switch ');
 const variant=/\b(?:slim|fat|pro|oled|lite|digital|disco|disc|v2|v1)\b/g;const versions=[...new Set((normalize(model)+' '+title).match(variant)||[])].map(v=>v==='disc'?'disco':v).sort();
 const capacities=[...new Set((normalize(model)+' '+title).match(/\b\d+(?:[.,]\d+)?\s*(?:gb|tb|w|mah)\b/g)||[])].map(v=>v.replace(/\s/g,'')).sort();
 const condition=['Novo','Usado'].includes(o.condition)?o.condition:/\bnovo\b|\blacrado\b/.test(text)&&!/\bsemi.?novo\b|\bcomo novo\b/.test(text)?'Novo':/\busado\b|\bseminovo\b|\bsemi novo\b/.test(text)?'Usado':'não informada';
 const risky=riskFor(text)!=='sem defeito informado'||o.risk==='alto/incerto';
 // Unknown attributes remain explicit: never mix unspecified capacity/variant with a known one.
 const key=model&&condition!=='não informada'?JSON.stringify([model.replace(variant,'').replace(/\b\d+(?:[.,]\d+)?\s*(?:gb|tb|w|mah)\b/g,'').replace(/\s+/g,' ').trim(),versions,capacities,condition,kind]):null;
 return {model,version:versions.join(' / ')||'não informada',capacity:capacities.join(' / ')||'não informada',condition,kind,key,risky,automatic:!o.reviewed};
}
export function simulate(o,resale,values={}){const s=scenario(values);const price=round(o.price*(1-s.buyDiscount/100));const extras=['shipping','tax','repair','reserve','fees'].reduce((sum,k)=>sum+(Number.isFinite(o[k])?o[k]:s[k]),0);const total=round(price+extras);if(!Number.isFinite(o.price)||o.price<=0)throw Error('Preço de compra inválido.');const target=resale===null?null:round(resale*(1-s.sellDiscount/100));const net=target===null?null:target*(1-s.saleFee/100);const profit=net===null?null:round(net-total);const maxPurchase=net===null?null:round(Math.max(0,net/(1+s.targetROI/100)-extras));return {total,target,profit,roi:profit===null?null:round(profit/total*100),maxPurchase,assumedCosts:['shipping','tax','repair','reserve','fees'].filter(k=>!Number.isFinite(o[k]))};}
export function automaticInsights(offers,now=Date.now(),radius=80,values={}){
 const s=scenario(values);const rows=offers.map(o=>({...o,identity:identify(o)}));
 return rows.filter(o=>o.source!=='Facebook').map(o=>{
 const comparable=rows.filter(r=>r.url!==o.url&&o.identity.key&&r.identity.key===o.identity.key&&!r.identity.risky&&now-r.lastSeen<=7*86400000);
 const local=comparable.filter(r=>['OLX','Facebook'].includes(r.source)&&region({...r,source:'Facebook'},radius).state==='local');
 const pool=local.length>=3?local:comparable.filter(r=>r.source!=='Facebook'||region(r,radius).state==='local');const prices=pool.map(r=>r.price);const typical=prices.length>=3?median(prices):null;const mean=prices.length>=3?prices.reduce((a,b)=>a+b,0)/prices.length:null;
 const calc=simulate(o,typical,s);const eligible=!o.identity.risky&&o.identity.kind==='produto'&&now-o.lastSeen<=86400000;
 const confidence=typical===null?'insuficiente':local.length>=5&&o.identity.version!=='não informada'&&o.identity.capacity!=='não informada'&&!calc.assumedCosts.length?'alta':local.length>=3?'moderada':'baixa';
 return {...o,...calc,typical,mean,samples:prices.length,regionalSamples:local.length,regionalMean:local.length>=3?local.reduce((a,b)=>a+b.price,0)/local.length:null,regionalMedian:local.length>=3?median(local.map(r=>r.price)):null,referenceBasis:local.length>=3?'regional':'entre fontes',confidence,saving:eligible?calc.profit:null,drop:o.history?.length>1?o.history[0].price-o.price:0,eligible};
 }).sort((a,b)=>(b.saving??-Infinity)-(a.saving??-Infinity));
}
export function automaticOpportunities(offers,now=Date.now(),radius=80,s={}){const rows=automaticInsights(offers,now,radius,s);return {ready:rows.filter(o=>o.saving>0),pending:rows.filter(o=>o.saving===null||o.assumedCosts.length).map(o=>({...o,missing:[...(o.identity.key?[]:['modelo ou condição não identificados']),...(o.identity.risky?['diagnóstico do defeito']:[]),...o.assumedCosts.map(k=>'custo '+k),...(!o.typical?['três comparáveis equivalentes']:[])]})),withoutReference:rows.filter(o=>o.typical===null).length};}
export function validateSale(raw){const sale={...raw};for(const k of ['buy','costs','sell','saleFees'])if(!Number.isFinite(sale[k])||sale[k]<0||sale[k]>1000000)throw Error('Valor de revenda inválido: '+k);if(typeof sale.title!=='string'||!sale.title.trim()||sale.title.length>300)throw Error('Informe o produto.');for(const k of ['boughtAt','soldAt'])if(!/^\d{4}-\d{2}-\d{2}$/.test(sale[k])||!Number.isFinite(Date.parse(sale[k]))||new Date(sale[k]).toISOString().slice(0,10)!==sale[k])throw Error('Data inválida.');if(sale.soldAt<sale.boughtAt||sale.soldAt>new Date().toISOString().slice(0,10))throw Error('Confira as datas da revenda.');return {...sale,profit:round(sale.sell-sale.saleFees-sale.buy-sale.costs),days:Math.round((Date.parse(sale.soldAt)-Date.parse(sale.boughtAt))/86400000)};}
