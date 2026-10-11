import test from 'node:test';
import assert from 'node:assert/strict';
import {searchPage,validNext} from '../extension/navigation.js';
test('avanço mantém plataforma, busca e caminho e rejeita login/destino externo',()=>{const a='https://shopee.com.br/search?keyword=PS5';assert.equal(searchPage(a),true);assert.equal(validNext(a,a+'&page=1'),true);assert.equal(validNext(a,'https://evil.test/search?keyword=PS5&page=1'),false);assert.equal(validNext(a,'https://shopee.com.br/search?keyword=iPhone&page=1'),false);assert.equal(validNext(a,'https://shopee.com.br/login'),false);assert.equal(validNext(a,a),false);assert.equal(searchPage('https://www.facebook.com/marketplace/item/123/'),false);});
