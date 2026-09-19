import { expect, test, type Page } from '@playwright/test';

async function image(page: Page, name = 'camino.png', width = 20) {
  const base64 = await page.evaluate((size) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.getContext('2d')!.fillRect(0, 0, size, size);
    return canvas.toDataURL('image/png').split(',')[1];
  }, width);
  return { name, mimeType: 'image/png', buffer: Buffer.from(base64, 'base64') };
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/captcha', (route) => route.fulfill({
    json: { id: 'a'.repeat(43), question: '12 + 7', expires_in: 600 },
  }));
  // All submissions are intercepted, including when inspecting production.
  await page.route('**/api/tickets', (route) => route.fulfill({
    status: 201, contentType: 'application/json',
    body: JSON.stringify({ tracking_code: 'BUZ-2026-TEST', status: 'new' }),
  }));
  await page.goto('/');
});

async function fillForm(page: Page) {
  await page.locator('[name="full_name"]').fill('Prueba automatizada');
  await page.locator('[name="email"]').fill('test@example.com');
  await page.locator('[name="description"]').fill('Prueba local de imagen adjunta en camino rural.');
  await page.getByRole('button', { name: 'Seleccionar Lugar del Problema', exact: true }).click();
  await page.locator('.leaflet-container').click({ position: { x: 150, y: 150 } });
  await page.getByRole('button', { name: 'Confirmar Ubicacion' }).click();
  await page.locator('[name="acceptedDataPolicy"]').check();
  await page.getByLabel('Verificación numérica', { exact: false }).fill('19');
}

test('preserves the native file selection after optimization and rerenders', async ({ page }) => {
  const input = page.locator('input[type="file"]');
  await input.setInputFiles(await image(page));
  await expect(page.getByText('La imagen ya tiene un tamaño adecuado.')).toBeVisible();
  await page.locator('[name="description"]').fill('Cambio posterior a la selección');
  await expect.poll(() => input.evaluate((el: HTMLInputElement) => el.files?.[0]?.name)).toBe('camino.png');
});

test('submits the image as multipart and clears it only after success', async ({ page }) => {
  await fillForm(page);
  const input = page.locator('input[type="file"]');
  await input.setInputFiles(await image(page));
  const request = page.waitForRequest('**/api/tickets');
  await page.getByRole('button', { name: 'Enviar Reporte', exact: true }).click();
  const sent = await request;
  expect(sent.headers()['content-type']).toContain('multipart/form-data');
  expect(sent.postDataBuffer()!.toString()).toContain('filename="camino.png"');
  await expect.poll(() => input.evaluate((el: HTMLInputElement) => el.files?.length)).toBe(0);
});

test('missing image is rejected before any request', async ({ page }) => {
  await fillForm(page);
  let sent = false;
  page.on('request', (request) => { if (request.url().endsWith('/api/tickets')) sent = true; });
  await page.getByRole('button', { name: 'Enviar Reporte', exact: true }).click();
  await expect(page.getByText('Debe adjuntar una imagen del problema', { exact: true })).toBeVisible();
  expect(sent).toBe(false);
});

test('replacement image is the one sent and survives a server error for retry', async ({ page }) => {
  await fillForm(page);
  const input = page.locator('input[type="file"]');
  await input.setInputFiles(await image(page, 'primera.png'));
  await expect(input).toBeEnabled();
  await input.setInputFiles(await image(page, 'segunda.png'));
  await page.route('**/api/tickets', (route) => route.fulfill({
    status: 500, contentType: 'application/json',
    body: JSON.stringify({ error: 'Error del sistema al procesar el archivo' }),
  }));
  const request = page.waitForRequest('**/api/tickets');
  await page.getByRole('button', { name: 'Enviar Reporte', exact: true }).click();
  expect((await request).postDataBuffer()!.toString()).toContain('filename="segunda.png"');
  await expect(page.getByText('Error del sistema al procesar el archivo', { exact: true })).toBeVisible();
  await expect.poll(() => input.evaluate((el: HTMLInputElement) => el.files?.[0]?.name)).toBe('segunda.png');
  await page.unroute('**/api/tickets');
  await page.route('**/api/tickets', (route) => route.fulfill({
    status: 201, contentType: 'application/json', body: JSON.stringify({ tracking_code: 'BUZ-2026-TEST' }),
  }));
  const retry = page.waitForRequest('**/api/tickets');
  await page.getByRole('button', { name: 'Enviar Reporte', exact: true }).click();
  expect((await retry).postDataBuffer()!.toString()).toContain('filename="segunda.png"');
  await expect.poll(() => input.evaluate((el: HTMLInputElement) => el.files?.length)).toBe(0);
});

test('sends the optimized image after resizing', async ({ page }) => {
  await fillForm(page);
  await page.locator('input[type="file"]').setInputFiles(await image(page, 'grande.png', 2200));
  await expect(page.getByText(/Imagen optimizada:/)).toBeVisible();
  const request = page.waitForRequest('**/api/tickets');
  await page.getByRole('button', { name: 'Enviar Reporte', exact: true }).click();
  expect((await request).postDataBuffer()!.toString()).toContain('filename="grande.webp"');
});

test('a corrupt image is not sent after processing fails', async ({ page }) => {
  await fillForm(page);
  let sent = false;
  page.on('request', (request) => { if (request.url().endsWith('/api/tickets')) sent = true; });
  await page.locator('input[type="file"]').setInputFiles({
    name: 'corrupta.png', mimeType: 'image/png', buffer: Buffer.from('not an image'),
  });
  await expect(page.getByText('El archivo está dañado o no es una imagen válida.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Enviar Reporte', exact: true }).click();
  await expect(page.getByText('El archivo está dañado o no es una imagen válida.', { exact: true })).toHaveCount(2);
  expect(sent).toBe(false);
});

test('captcha is mandatory locally and included in multipart', async ({ page }) => {
  await fillForm(page);
  await page.locator('input[type="file"]').setInputFiles(await image(page));
  await page.locator('[name="captcha_answer"]').fill('');
  await page.getByRole('button', { name: 'Enviar Reporte', exact: true }).click();
  await expect(page.getByText('Escribí el resultado numérico de la suma.')).toBeVisible();
  await page.locator('[name="captcha_answer"]').fill('19');
  const request = page.waitForRequest('**/api/tickets');
  await page.getByRole('button', { name: 'Enviar Reporte', exact: true }).click();
  const body = (await request).postDataBuffer()!.toString();
  expect(body).toContain('name="captcha_id"\r\n\r\n' + 'a'.repeat(43));
  expect(body).toContain('name="captcha_answer"\r\n\r\n19');
});

test('captcha rejection refreshes only the challenge and retains the report', async ({ page }) => {
  await fillForm(page);
  await page.locator('input[type="file"]').setInputFiles(await image(page));
  await page.route('**/api/tickets', (route) => route.fulfill({
    status: 400, json: { code: 'captcha_invalid', error: 'Verificación incorrecta' },
  }));
  await page.getByRole('button', { name: 'Enviar Reporte', exact: true }).click();
  await expect(page.getByText(/La respuesta es incorrecta o venció/)).toBeVisible();
  await expect(page.locator('[name="captcha_answer"]')).toHaveValue('');
  await expect(page.locator('[name="full_name"]')).toHaveValue('Prueba automatizada');
  await expect.poll(() => page.locator('input[type="file"]').evaluate((el: HTMLInputElement) => el.files?.[0]?.name)).toBe('camino.png');
});

test('captcha load failure can be retried without resetting the form', async ({ page }) => {
  await fillForm(page);
  await page.route('**/api/captcha', (route) => route.fulfill({ status: 503, json: {} }));
  await page.getByRole('button', { name: 'Nueva suma' }).click();
  await expect(page.getByText(/No se pudo cargar la verificación/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enviar Reporte', exact: true })).toBeDisabled();
  await page.route('**/api/captcha', (route) => route.fulfill({
    json: { id: 'b'.repeat(43), question: '1 + 2', expires_in: 600 },
  }));
  await page.getByRole('button', { name: 'Nueva suma' }).click();
  await expect(page.getByText('¿Cuánto es 1 + 2?')).toBeVisible();
  await expect(page.locator('[name="full_name"]')).toHaveValue('Prueba automatizada');
});
