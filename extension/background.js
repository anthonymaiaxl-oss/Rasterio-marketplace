import {defaults,sourceFor,searchURL,mergeOffers} from './core.js';
let queue=Promise.resolve();
function serial(fn){const next=queue.then(fn);queue=next.catch(()=>{});return next;}
async function settings(){return {...defaults,...(await chrome.storage.local.get('settings')).settings};}
async function schedule(s){
 await chrome.alarms.clear('rotate');
 if(s.running){const nextRotation=Date.now()+s.minutes*60000;await chrome.alarms.create('rotate',{when:nextRotation,periodInMinutes:s.minutes});await chrome.storage.local.set({settings:{...s,nextRotation}});}
 else await chrome.storage.local.set({settings:{...s,nextRotation:null}});
}
async function ensureSchedule(){const s=await settings();if(!s.running)return;if(!await chrome.alarms.get('rotate')){const when=Math.max(Date.now()+1000,s.nextRotation||Date.now()+s.minutes*60000);await chrome.alarms.create('rotate',{when,periodInMinutes:s.minutes});await chrome.storage.local.set({settings:{...s,nextRotation:when}});}}
async function rotate(){const s=await settings();if(!s.running||!s.terms.length)return;const term=s.terms[s.index%s.terms.length];const results=[];
 for(const source of ['OLX','AliExpress','Shopee',...(s.facebookConfirmed?['Facebook']:[])]){
  try{const url=searchURL(source,term);let tab;try{if(s.tabs[source])tab=await chrome.tabs.get(s.tabs[source]);}catch{}
   // Only reuse tabs still on the expected marketplace; never navigate unrelated user tabs.
   if(tab&&sourceFor(tab.url)===source)await chrome.tabs.update(tab.id,{url,active:false});else {tab=await chrome.tabs.create({url,active:false});s.tabs[source]=tab.id;}
   results.push({source,ok:true});
  }catch(e){results.push({source,ok:false,error:String(e.message).slice(0,200)});}
 }
 s.index=(s.index+1)%s.terms.length;s.lastRotation=Date.now();s.lastTerm=term;s.rotationResults=results;
 const alarm=await chrome.alarms.get('rotate');s.nextRotation=alarm?.scheduledTime||Date.now()+s.minutes*60000;
 await chrome.storage.local.set({settings:s});
}
// Service workers restart often; alarms may disappear after browser restart.
serial(ensureSchedule);
chrome.action.onClicked.addListener(()=>chrome.tabs.create({url:chrome.runtime.getURL('dashboard.html')}));
chrome.runtime.onInstalled.addListener(()=>serial(async()=>{const s=await settings();await chrome.storage.local.set({settings:s});await schedule(s);}));
chrome.runtime.onStartup.addListener(()=>serial(async()=>schedule(await settings())));
chrome.alarms.onAlarm.addListener(a=>{if(a.name==='rotate')serial(rotate).catch(async e=>chrome.storage.local.set({rotationError:String(e.message)}));});
chrome.runtime.onMessage.addListener((m,sender,respond)=>{
 const internal=sender.url?.startsWith(chrome.runtime.getURL('dashboard.html'));
 if(m.type==='collect'&&sender.tab&&sourceFor(sender.url)){
 serial(async()=>{const s=await settings();const source=sourceFor(sender.url);if(!s.running||s.tabs[source]!==sender.tab.id)return {ok:true,ignored:true};const data=await chrome.storage.local.get('offers');const incoming=(Array.isArray(m.offers)?m.offers:[]).filter(o=>sourceFor(o.url)===source).map(o=>({...o,source,regionVerified:source==='Facebook'&&s.facebookConfirmed}));await chrome.storage.local.set({offers:mergeOffers(data.offers||[],incoming),lastCollection:{source,count:incoming.length,at:Date.now()}});return {ok:true};}).then(respond,e=>respond({error:e.message}));return true;
 }
 if(!internal)return;
 serial(async()=>{
 if(m.type==='diagnostics'){await ensureSchedule();return {ok:true,alarm:await chrome.alarms.get('rotate')};}
 if(m.type==='rotateNow'){const s=await settings();if(!s.running)throw Error('Ative e salve o acompanhamento primeiro.');await rotate();}
 if(m.type==='settings'){const old=await settings();const terms=String(m.terms||'').split('\n').map(t=>t.trim().slice(0,100)).filter(Boolean).slice(0,100);if(!terms.length)throw Error('Informe pelo menos uma busca.');const s={...old,running:Boolean(m.running),minutes:Math.max(10,Math.min(120,Number(m.minutes)||15)),terms,facebookConfirmed:Boolean(m.facebookConfirmed)};await chrome.storage.local.set({settings:s});await schedule(s);if(s.running&&!old.running)await rotate();}
 if(m.type==='review'){const d=await chrome.storage.local.get('offers');const offers=d.offers||[];const o=offers.find(o=>o.url===m.url);if(!o)throw Error('Anúncio não encontrado.');const r=m.review;for(const k of ['shipping','tax','repair','reserve'])if(!Number.isFinite(r[k])||r[k]<0||r[k]>1000000)throw Error('Informe os custos, inclusive zero quando confirmado.');Object.assign(o,{model:String(r.model).trim().slice(0,150),condition:['Novo','Usado'].includes(r.condition)?r.condition:'Usado',working:Boolean(r.working),simpleRepair:Boolean(r.simpleRepair),delivery:Boolean(r.delivery),shipping:r.shipping,tax:r.tax,repair:r.repair,reserve:r.reserve,reviewed:true});await chrome.storage.local.set({offers});}
 if(m.type==='clear')await chrome.storage.local.remove(['offers','lastCollection']);
 return {ok:true};
 }).then(respond,e=>respond({error:e.message}));return true;
});
