import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
const profile=await mkdtemp(resolve(tmpdir(),'rasterio-chrome-'));
const extension=resolve('extension');
let context;
try{
context=await chromium.launchPersistentContext(profile,{executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,ignoreDefaultArgs:['--disable-extensions'],args:['--no-sandbox','--disable-features=DisableLoadExtensionCommandLineSwitch',`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
await context.route('https://**/*',async route=>{const u=new URL(route.request().url());const path=u.hostname.includes('olx')?'/anuncio/12345678':u.hostname.includes('aliexpress')?'/item/12345678.html':u.hostname.includes('shopee')?'/PS5-i.123.456':'/marketplace/item/12345678/';await route.fulfill({contentType:'text/html',body:`<html><body><article><a href="${path}"><h2>PS5 disco 825GB funcionando</h2><span>R$ 1.500,00</span></a></article><article><a href="${path.replace('12345678','87654321').replace('123.456','123.789')}"><h2>Preço ambíguo</h2>R$ 1.000,00 R$ 100,00</a></article></body></html>`});});
const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');const id=new URL(worker.url()).host;const page=await context.newPage();await page.goto(`chrome-extension://${id}/dashboard.html`);await page.locator('#terms').fill('PS5');await page.locator('#running').check();await page.getByRole('button',{name:'Salvar acompanhamento'}).click();
for(let count=1;count<=3;count++){await page.waitForFunction(async n=>((await chrome.storage.local.get('offers')).offers||[]).length===n,count,{timeout:20000});if(count<3)await page.locator('#rotate-now').click();}
const data=await worker.evaluate(()=>chrome.storage.local.get(['offers','settings']));assert.equal(data.offers.length,3);assert.equal(data.settings.running,true);assert.equal(Object.keys(data.settings.tabs).length,1);assert.ok(data.offers.every(o=>o.price===1500));assert.ok(data.offers.every(o=>!o.reviewed));
await page.locator('article').first().locator('input[name=model]').fill('PS5 disco 825GB');await page.locator('article').first().locator('input[name=working]').check();await page.locator('article').first().locator('input[name=delivery]').check();for(const field of ['shipping','tax','repair','reserve'])await page.locator('article').first().locator(`input[name=${field}]`).fill('0');await page.locator('article').first().getByRole('button',{name:'Salvar revisão'}).click();await page.waitForFunction(async()=>((await chrome.storage.local.get('offers')).offers||[]).some(o=>o.reviewed));
await page.locator('#running').uncheck();await page.getByRole('button',{name:'Salvar acompanhamento'}).click();await page.waitForFunction(async()=>!(await chrome.storage.local.get('settings')).settings.running);assert.equal(await worker.evaluate(async()=>Boolean(await chrome.alarms.get('rotate'))),false);
await page.reload();await page.locator('article').first().waitFor();assert.equal(await page.locator('#running').isChecked(),false);assert.match(await page.locator('#summary').innerText(),/3 anúncios/);
console.log('PASS: extensão carregada, rodízio de 3 fontes, extrator conservador, revisão, pausa e persistência.');
}finally{await context?.close();await rm(profile,{recursive:true,force:true});}
