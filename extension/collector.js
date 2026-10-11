(()=>{
 const host=location.hostname;const source=host.endsWith('olx.com.br')?'OLX':host.endsWith('aliexpress.com')?'AliExpress':host.endsWith('shopee.com.br')?'Shopee':'Facebook';
 const paths={OLX:/\/\d{6,}(?:[/?#]|$)|\/anuncio\//,AliExpress:/\/item\/\d+\.html/,Shopee:/-i\.\d+\.\d+|\/product\/\d+\/\d+/,Facebook:/\/marketplace\/item\/\d+/};
 const validHost=u=>u.protocol==='https:'&&!u.username&&!u.password&&(source==='AliExpress'?(u.hostname==='aliexpress.com'||u.hostname.endsWith('.aliexpress.com')):source==='Shopee'?['shopee.com.br','www.shopee.com.br'].includes(u.hostname):source==='OLX'?(u.hostname==='olx.com.br'||u.hostname.endsWith('.olx.com.br')):u.hostname==='www.facebook.com');
 const norm=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const blocked=()=>/captcha|verifique que voce|verify you are human|confirme que voce|verificacao de seguranca/.test(norm(document.body?.innerText||''));
 function visibleText(node){const clone=node.cloneNode(true);clone.querySelectorAll('del,s,strike,[aria-hidden="true"],script,style').forEach(n=>n.remove());return clone.textContent||'';}
 function pricesIn(text){const values=[];for(const m of text.matchAll(/R\$\s*(\d[\d.]*\s*(?:,\s*\d{2})?)(?![\d,])/g)){const amount=m[1].replace(/\s/g,'');let value;if(amount.includes(','))value=Number(amount.replaceAll('.','').replace(',','.'));else if(/^\d+\.\d{2}$/.test(amount))value=Number(amount);else value=Number(amount.replaceAll('.',''));if(Number.isFinite(value)&&value>0&&value<=1000000)values.push(value);}return values;}
 function priceOf(card){const selectors=source==='AliExpress'?'[class*="price--current"],[class*="price-current"],[data-testid="product-price"]':source==='Shopee'?'[data-sqe="price"],[data-testid="product-price"]':'';
 if(selectors){const primary=[...card.querySelectorAll(selectors)].filter(n=>!n.closest('del,s,strike'));const values=primary.flatMap(n=>/\d\s*x|parcela/i.test(visibleText(n))?[]:pricesIn(visibleText(n)));if(values.length===1)return values[0];if(values.length>1)return null;}
 const text=visibleText(card);if(/\d\s*x\s*(?:de\s*)?R\$|parcelas?\s*(?:de\s*)?R\$/i.test(text))return null;const values=pricesIn(text);return values.length===1?values[0]:null;
 }
 let lastScan=0;
 function collect(){if(!document.body)return;lastScan=Date.now();const offers=[],seen=new Set();const diagnostics={links:0,ambiguousPrice:0,missingTitle:0,blocked:blocked()};if(!diagnostics.blocked)for(const a of document.querySelectorAll('a[href]')){
 let u;try{u=new URL(a.href);}catch{continue;}if(!validHost(u)||!paths[source].test(u.pathname))continue;u.search='';u.hash='';if(seen.has(u.href))continue;diagnostics.links++;
 let card=a;for(let depth=0;depth<6;depth++){if(pricesIn(visibleText(card)).length)break;if(!card.parentElement)break;const parent=card.parentElement;const itemLinks=[...parent.querySelectorAll('a[href]')].filter(el=>{try{const x=new URL(el.href,location.href);return validHost(x)&&paths[source].test(x.pathname);}catch{return false;}});if(new Set(itemLinks.map(el=>el.href.split('?')[0])).size>1)break;card=parent;}
 const text=(card.innerText||visibleText(card)).trim(),price=priceOf(card);if(price===null){diagnostics.ambiguousPrice++;continue;}
 const heading=card.querySelector('h2,h3,[data-testid="adcard-title"],[data-testid="ad-card-title"],[data-sqe="name"]');const title=(heading?.innerText||a.querySelector('img')?.alt||a.getAttribute('title')||text.split('\n').filter(t=>!t.includes('R$')).join(' ')).trim();if(!title){diagnostics.missingTitle++;continue;}
 const img=card.querySelector('img');const image=img?.currentSrc||img?.src||'';offers.push({source,url:u.href,title:title.slice(0,300),text:text.slice(0,1500),price,image});seen.add(u.href);if(offers.length>=100)break;
 }chrome.runtime.sendMessage({type:'collect',offers,diagnostics}).catch(()=>{});}
 setTimeout(collect,5000);setInterval(collect,120000);
 // Search pages render after navigation; rescan after loaded results appear.
 let pending;new MutationObserver(()=>{if(Date.now()-lastScan<20000||pending)return;pending=setTimeout(()=>{pending=null;collect();},3000);}).observe(document.documentElement,{childList:true,subtree:true});
})();
