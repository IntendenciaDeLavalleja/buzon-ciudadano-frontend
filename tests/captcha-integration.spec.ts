import { expect, test } from '@playwright/test';

test('real Flask validates captcha, accepts photo, and rejects replay', async ({ page }) => {
  test.skip(!process.env.INTEGRATION_API_URL, 'Requires the isolated Flask integration server');
  await page.goto('/');
  await page.locator('[name="full_name"]').fill('Integración local');
  await page.locator('[name="email"]').fill('test@example.com');
  await page.locator('[name="description"]').fill('Verificación integrada del reporte con foto y captcha.');
  await page.getByRole('button', { name: 'Seleccionar Lugar del Problema', exact: true }).click();
  await page.locator('.leaflet-container').click({ position: { x: 150, y: 150 } });
  await page.getByRole('button', { name: 'Confirmar Ubicacion' }).click();
  await page.locator('[name="acceptedDataPolicy"]').check();
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 20;
    canvas.getContext('2d')!.fillRect(0, 0, 20, 20);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await page.locator('input[type="file"]').setInputFiles({
    name: 'camino.png', mimeType: 'image/png',
    buffer: Buffer.from(png, 'base64'),
  });
  // An incorrect answer goes through the real backend and must preserve the file.
  await page.locator('[name="captcha_answer"]').fill('99');
  const rejected = page.waitForResponse('**/api/tickets');
  const refreshed = page.waitForResponse('**/api/captcha');
  await page.getByRole('button', { name: 'Enviar Reporte', exact: true }).click();
  const rejection = await rejected;
  expect(rejection.status()).toBe(400);
  expect((await rejection.json()).code).toBe('captcha_invalid');
  const challenge = await (await refreshed).json();
  await expect(page.getByText(/La respuesta es incorrecta o venció/)).toBeVisible();
  const question = await page.locator('#captcha-question').innerText();
  const terms = question.match(/(\d+) \+ (\d+)/)!;
  await page.locator('[name="captcha_answer"]').fill(String(Number(terms[1]) + Number(terms[2])));
  const accepted = page.waitForResponse('**/api/tickets');
  await page.getByRole('button', { name: 'Enviar Reporte', exact: true }).click();
  const response = await accepted;
  expect(response.status(), await response.text()).toBe(201);
  const replay = await page.request.post(response.url(), {
    data: {
      municipality_or_destination: 'Intendencia de Lavalleja', category: 'camineria_rural',
      full_name: 'Integración local', email: 'test@example.com', description: 'Prueba de repetición de captcha',
      location_lat: -33.9, location_lng: -54.8,
      captcha_id: challenge.id, captcha_answer: String(Number(terms[1]) + Number(terms[2])),
    },
  });
  expect(replay.status()).toBe(400);
  expect((await replay.json()).code).toBe('captcha_invalid');
  await expect(page.locator('input[type="file"]')).toHaveValue('');
});
