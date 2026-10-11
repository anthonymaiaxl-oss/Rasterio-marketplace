import test from 'node:test';
import assert from 'node:assert/strict';
import {products,filterProducts,cartTotal,money} from '../src/catalog.js';
test('busca ignora acentos e caixa',()=>assert.equal(filterProducts({query:'CAMERA'})[0].name,'Câmera Instant Mini'));
test('combina categoria e preço',()=>assert.deepEqual(filterProducts({category:'Tecnologia',maxPrice:300}).map(p=>p.id),[2]));
test('ordenação por preço e busca vazia',()=>{const list=filterProducts({sort:'low'});assert.equal(list.length,8);assert.equal(list[0].id,8);assert.equal(filterProducts({query:'inexistente'}).length,0);});
test('calcula quantidades e formato brasileiro',()=>{assert.equal(cartTotal([{id:1,quantity:2},{id:8,quantity:1}]),459.7);assert.match(money(189.9),/189,90/);assert.equal(cartTotal([]),0);assert.equal(new Set(products.map(p=>p.id)).size,products.length);});
