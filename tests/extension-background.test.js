import test from 'node:test';
import assert from 'node:assert/strict';
let listener;let alarmListener;let store={};let tabs=new Map();let nextId=1;let alarm=null;
const event=()=>({addListener(){}});
globalThis.chrome={storage:{local:{async get(keys){return Object.fromEntries((Array.isArray(keys)?keys:[keys]).map(k=>[k,structuredClone(store[k])]));},async set(data){Object.assign(store,structuredClone(data));},async remove(keys){for(const k of keys)delete store[k];}}},alarms:{async clear(){alarm=null;},async get(){return alarm;},async create(name,spec){alarm={...spec,scheduledTime:spec.when};},onAlarm:{addListener(fn){alarmListener=fn;}}},tabs:{async create(opts){const t={id:nextId++,...opts};tabs.set(t.id,t);return t;},async get(id){if(!tabs.has(id))throw Error('missing');return tabs.get(id);},async remove(id){tabs.delete(id);},async update(id,opts){Object.assign(tabs.get(id),opts);return tabs.get(id);}},runtime:{getURL:path=>'chrome-extension://test/'+path,onInstalled:event(),onStartup:event(),onMessage:{addListener(fn){listener=fn;}}},action:{onClicked:event()}};
await import('../extension/background.js');
const internal={url:'chrome-extension://test/dashboard.html'};
const message=(m,s=internal)=>new Promise(resolve=>{const accepted=listener(m,s,resolve);if(!accepted)resolve(null);});
test('serviço real: rodízio, pausa, filtro de abas e persistência de revisão',async()=>{
 assert.equal((await message({type:'settings',terms:'PS5\niPhone',minutes:15,running:true,facebookConfirmed:false})).ok,true);
 assert.equal(tabs.size,1);assert.equal(alarm.periodInMinutes,15);assert.equal(store.settings.index,0);
 const olx=store.settings.tabs.OLX;const payload={type:'collect',offers:[{url:'https://www.olx.com.br/anuncio/12345678',source:'OLX',title:'PS5',text:'funcionando',price:1000}]};
 await message(payload,{url:'https://www.olx.com.br/brasil?q=PS5',tab:{id:999}});assert.equal(store.offers,undefined);
 await message(payload,{url:'https://www.olx.com.br/brasil?q=PS5',tab:{id:olx}});assert.equal(store.offers.length,1);
 await message({type:'review',url:payload.offers[0].url,review:{model:'PS5 disco',condition:'Usado',working:true,delivery:true,shipping:0,tax:0,repair:0,reserve:50}});assert.equal(store.offers[0].reviewed,true);
 const before=tabs.get(olx).url;await message({type:'settings',terms:'PS5',minutes:15,running:false});assert.equal(alarm,null);
 await message({...payload,offers:[{...payload.offers[0],price:500}]},{url:before,tab:{id:olx}});assert.equal(store.offers[0].price,1000);
 assert.equal(await message({type:'clear'},{url:'https://evil.test/'}),null);assert.equal(store.offers.length,1);
});

test('restaura alarme ausente e roda manualmente sem interromper outras fontes',async()=>{
 await message({type:'settings',terms:'PS5\niPhone',minutes:15,running:true});alarm=null;
 const diag=await message({type:'diagnostics'});assert.ok(diag.alarm);assert.equal(diag.alarm.periodInMinutes,15);
 const create=chrome.tabs.create,update=chrome.tabs.update;chrome.tabs.create=async()=>{throw Error('Aba temporariamente indisponível');};chrome.tabs.update=async()=>{throw Error('Aba temporariamente indisponível');};
 assert.equal((await message({type:'rotateNow'})).ok,true);assert.equal(store.settings.rotationResults.length,1);assert.equal(store.settings.rotationResults[0].ok,false);assert.match(store.settings.rotationResults[0].error,/indisponível/);chrome.tabs.create=create;chrome.tabs.update=update;
 assert.equal((await message({type:'rotateNow'})).ok,true);assert.equal(store.settings.rotationResults[0].ok,true);
});

test('coleta por link autoriza apenas o anúncio solicitado mesmo com rodízio pausado',async()=>{
 await message({type:'settings',terms:'PS5',minutes:15,running:false});
 const result=await message({type:'captureLink',url:'https://www.facebook.com/marketplace/item/123456/?ref=search'},{url:'chrome-extension://test/insights.html'});assert.equal(result.ok,true);
 const id=nextId-1;assert.equal(tabs.get(id).url,'https://www.facebook.com/marketplace/item/123456/');
 const sample={source:'Facebook',title:'PS5 semi novo',price:1999,text:'Nova Mutum, MT',url:tabs.get(id).url};
 await message({type:'collect',offers:[sample,{...sample,url:'https://www.facebook.com/marketplace/item/999999/'}],diagnostics:{detail:true}},{url:tabs.get(id).url,tab:{id}});
 assert.ok(store.offers.some(o=>o.url===sample.url));assert.ok(!store.offers.some(o=>o.url.endsWith('/999999/')));
 const denied=await message({type:'captureLink',url:'https://www.facebook.com/messages/'});assert.match(denied.error,/anúncio/);
});

test('alarme alterna entre produtos configurados, em vez de repetir apenas PS5',async()=>{await message({type:'settings',terms:'PS5\niPhone 13\nparafusadeira',minutes:15,running:true});const terms=new Set([store.settings.lastTerm]);for(let i=0;i<8;i++){alarmListener({name:'rotate'});await message({type:'diagnostics'});terms.add(store.settings.lastTerm);}assert.equal(terms.size,3);assert.ok(terms.has('parafusadeira'));});

test('ciclo visita todos os termos em todas as fontes duas vezes, uma plataforma por rodada',async()=>{store.settings={...store.settings,running:false,index:0,platformIndex:0,passIndex:0};await message({type:'settings',terms:'PS5\niPhone',minutes:10,passes:2,running:true,facebookConfirmed:true});for(let i=0;i<15;i++){assert.equal(store.settings.rotationResults.length,1);alarmListener({name:'rotate'});await message({type:'diagnostics'});}assert.equal(store.settings.dailyProgress.visited.length,16);assert.equal(store.settings.index,0);assert.equal(store.settings.platformIndex,0);assert.equal(store.settings.passIndex,0);});

test('modo econômico reutiliza uma aba para o ciclo e não navega aba desviada pelo usuário',async()=>{const managed=store.settings.managedTabId;const before=tabs.size;await message({type:'rotateNow'});assert.equal(store.settings.managedTabId,managed);assert.equal(Object.keys(store.settings.tabs).length,1);assert.equal(tabs.size,before);tabs.get(managed).url='https://example.com/';await message({type:'rotateNow'});assert.notEqual(store.settings.managedTabId,managed);assert.equal(tabs.get(managed).url,'https://example.com/');});
test('páginas comuns e acompanhamento pausado não fazem leitura de DOM',async()=>{const source=store.settings.lastSource;const url=tabs.get(store.settings.managedTabId).url;const id=store.settings.managedTabId;assert.equal((await message({type:'collectorState'},{url,tab:{id:999999}})).allowed,false);assert.equal((await message({type:'collectorState'},{url,tab:{id}})).allowed,true);await message({type:'settings',terms:'PS5',running:false,minutes:10});assert.equal((await message({type:'collectorState'},{url,tab:{id}})).allowed,false);});
