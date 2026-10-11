(()=>{
 const host=location.hostname;const source=host.endsWith('olx.com.br')?'OLX':host.endsWith('aliexpress.com')?'AliExpress':host.endsWith('shopee.com.br')?'Shopee':'Facebook';
 const paths={OLX:/\/\d{6,}(?:[/?#]|$)|\/anuncio\//,AliExpress:/\/item\/\d+\.html/,Shopee:/-i\.\d+\.\d+|\/product\/\d+\/\d+/,Facebook:/\/marketplace\/item\/\d+/};
 const blocked=()=>/captcha|verifique que voce|verify you are human|confirme que voce/i.test(document.body?.innerText||'');
 function collect(){if(!document.body||blocked())return;const offers=[];const seen=new Set();for(const a of document.querySelectorAll('a[href]')){
 let u;try{u=new URL(a.href);}catch{continue;}if(u.origin!==location.origin||!paths[source].test(u.pathname))continue;u.search='';u.hash='';if(seen.has(u.href))continue;
 let card=a;for(let depth=0;depth<5;depth++){if(/R\$\s*\d/.test(card.innerText||''))break;if(!card.parentElement)break;const parent=card.parentElement;const itemLinks=[...parent.querySelectorAll('a[href]')].filter(el=>paths[source].test(new URL(el.href,location.href).pathname));if(new Set(itemLinks.map(el=>el.href.split('?')[0])).size>1)break;card=parent;}
 const text=(card.innerText||'').trim();const prices=text.match(/R\$\s*[\d.]+(?:,\d{2})?/g)||[];
 // Multiple prices may be installments, variants or promotions: require one unambiguous price.
 if(prices.length!==1)continue;const price=Number(prices[0].replace(/R\$\s*/,'').replaceAll('.','').replace(',','.'));if(!price||price>1000000)continue;
 const heading=card.querySelector('h2,h3,[data-testid="adcard-title"],[data-testid="ad-card-title"]');const title=(heading?.innerText||a.querySelector('img')?.alt||text.split('\n').filter(t=>!t.includes('R$')).join(' ')).trim();if(!title)continue;
 offers.push({source,url:u.href,title:title.slice(0,300),text:text.slice(0,1500),price});seen.add(u.href);if(offers.length>=100)break;
 }chrome.runtime.sendMessage({type:'collect',offers}).catch(()=>{});}
 setTimeout(collect,5000);setInterval(collect,120000);
})();
