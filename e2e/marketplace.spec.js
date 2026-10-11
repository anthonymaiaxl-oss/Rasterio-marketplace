import {test,expect} from '@playwright/test';
test('busca, filtros, detalhes e carrinho persistente',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.locator('.card')).toHaveCount(8);
 await page.getByRole('searchbox').fill('CAMERA');await page.getByRole('button',{name:'Buscar',exact:true}).click();await expect(page.locator('.card')).toHaveCount(1);await expect(page.locator('.card')).toContainText('Câmera Instant Mini');
 await page.getByRole('button',{name:'Limpar',exact:true}).click();
 await page.locator('aside').getByLabel('Tecnologia',{exact:true}).check();await expect(page.locator('.card')).toHaveCount(2);
 await page.locator('#price').fill('300');await expect(page.locator('.card')).toHaveCount(1);
 await page.getByRole('button',{name:'Limpar',exact:true}).click();
 await page.locator('#sort').selectOption('low');await expect(page.locator('.card').first()).toContainText('Garrafa Flow');
 await page.getByRole('link',{name:'Ver Luminária Aurora',exact:true}).click();await expect(page.getByRole('heading',{name:'Luminária Aurora',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Adicionar ao carrinho +',exact:true}).click();await page.getByRole('link',{name:'Ver meu carrinho'}).click();await expect(page.locator('.cart-item')).toHaveCount(1);
 await page.getByRole('button',{name:'Aumentar quantidade de Luminária Aurora'}).click();await expect(page.locator('.summary .total')).toContainText('379,80');
 await page.reload();await expect(page.locator('.quantity span')).toHaveText('2');
 await page.getByRole('button',{name:'Concluir simulação'}).click();await expect(page.locator('#checkout-result')).toContainText('Simulação concluída');
 await page.getByRole('button',{name:'Remover',exact:true}).click();await expect(page.getByRole('heading',{name:'Seu carrinho está esperando boas escolhas'})).toBeVisible();
 await page.goto('/#/produto/999');await expect(page.getByRole('heading',{name:'Produto não encontrado'})).toBeVisible();
 expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
});
