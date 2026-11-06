import { test, expect } from '@playwright/test';
for(const success of [true, false]) {
 test(`partner public application ${success?'confirms real server acceptance':'requires explicit WhatsApp on server rejection'}`, async ({page}) => {
  let payload: Record<string,unknown> | undefined;
  await page.route('**/rest/v1/partner_applications*',async route=>{
    if(route.request().method()!=='POST') return route.continue();
    payload=route.request().postDataJSON();
    await route.fulfill({status:success?201:403,contentType:'application/json',body:success?'':'{"message":"RLS denied"}'});
  });
  await page.goto('/devenir-partenaire');
  await page.locator('#nomActivite').fill('Prospect TEST NON ENREGISTRÉ');
  await page.locator('#nomResponsable').fill('Contact Test');
  await page.locator('#telephone').fill('0696123456');
  await page.locator('#commune').selectOption({index:1});
  await page.locator('#typeActivite').selectOption({index:1});
  await page.getByRole('button',{name:'Envoyer ma candidature'}).click();
  await expect.poll(()=>payload).toBeTruthy();
  expect(payload?.partner_type).toBe('vendor');
  expect(payload?.business_name).toBe('Prospect TEST NON ENREGISTRÉ');
  if(success) {
   await expect(page.getByRole('heading',{name:'Candidature enregistrée'})).toBeVisible();
  } else {
   await expect(page.getByRole('alert')).toContainText('n’a pas été enregistrée');
   await expect(page.getByRole('link',{name:/Transmettre ma candidature sur WhatsApp/})).toHaveAttribute('href',/^https:\/\/wa\.me\//);
   await expect(page.getByRole('heading',{name:'Candidature enregistrée'})).toHaveCount(0);
  }
 });
}
