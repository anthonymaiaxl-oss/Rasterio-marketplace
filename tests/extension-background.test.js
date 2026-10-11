import test from 'node:test';
import assert from 'node:assert/strict';
let listener;let alarmListener;let store={};let tabs=new Map();let nextId=1;let alarm=null;
const event=()=>({addListener(){}});
globalThis.chrome={storage:{local:{async get(keys){return Object.fromEntries((Array.isArray(keys)?keys:[keys]).map(k=>[k,structuredClone(store[k])]));},async set(data){Object.assign(store,structuredClone(data));},async remove(keys){for(const k of keys)delete store[k];}}},alarms:{async clear(){alarm=null;},async create(name,spec){alarm=spec;},onAlarm:{addListener(fn){alarmListener=fn;}}},tabs:{async create(opts){const t={id:nextId++,...opts};tabs.set(t.id,t);return t;},async get(id){if(!tabs.has(id))throw Error('missing');return tabs.get(id);},async update(id,opts){Object.assign(tabs.get(id),opts);return tabs.get(id);}},runtime:{getURL:path=>'chrome-extension://test/'+path,onInstalled:event(),onStartup:event(),onMessage:{addListener(fn){listener=fn;}}},action:{onClicked:event()}};
await import('../extension/background.js');
const internal={url:'chrome-extension://test/dashboard.html'};
const message=(m,s=internal)=>new Promise(resolve=>{const accepted=listener(m,s,resolve);if(!accepted)resolve(null);});
test('serviço real: rodízio, pausa, filtro de abas e persistência de revisão',async()=>{
 assert.equal((await message({type:'settings',terms:'PS5\niPhone',minutes:15,running:true,facebookConfirmed:false})).ok,true);
 assert.equal(tabs.size,3);assert.equal(alarm.periodInMinutes,15);assert.equal(store.settings.index,1);
 const olx=store.settings.tabs.OLX;const payload={type:'collect',offers:[{url:'https://www.olx.com.br/anuncio/12345678',source:'OLX',title:'PS5',text:'funcionando',price:1000}]};
 await message(payload,{url:'https://www.olx.com.br/brasil?q=PS5',tab:{id:999}});assert.equal(store.offers,undefined);
 await message(payload,{url:'https://www.olx.com.br/brasil?q=PS5',tab:{id:olx}});assert.equal(store.offers.length,1);
 await message({type:'review',url:payload.offers[0].url,review:{model:'PS5 disco',condition:'Usado',working:true,delivery:true,shipping:0,tax:0,repair:0,reserve:50}});assert.equal(store.offers[0].reviewed,true);
 const before=tabs.get(olx).url;await message({type:'settings',terms:'PS5',minutes:15,running:false});assert.equal(alarm,null);
 await message({...payload,offers:[{...payload.offers[0],price:500}]},{url:before,tab:{id:olx}});assert.equal(store.offers[0].price,1000);
 assert.equal(await message({type:'clear'},{url:'https://evil.test/'}),null);assert.equal(store.offers.length,1);
});
