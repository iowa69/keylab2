import { expect, test, type Page } from '@playwright/test';
const storageKey = 'keylab2-playroom-v3';
const pageErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
});
test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page)).toEqual([]);
});
async function parents(page: Page) {
  const button = page.getByRole('button', { name: 'Hold for 3 seconds for grown-ups' });
  await button.focus();
  await page.keyboard.down('Space');
  await page.waitForTimeout(3100);
  await page.keyboard.up('Space');
  await page.getByLabel('What is 7 + 5?').fill('12');
  await page.getByRole('button', { name: 'Open grown-up space' }).click();
}
async function setup(page: Page, toy = 'sea', extra: Record<string, unknown> = {}) {
  await page.addInitScript(
    ({ key, settings }) => localStorage.setItem(key, JSON.stringify(settings)),
    { key: storageKey, settings: { toy, sound: false, ...extra } },
  );
  await page.goto('/');
}
test('opens straight into a playable toy, with no child menu', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveAttribute('data-toy', 'sea');
  await expect(page.locator('button')).toHaveCount(1);
  await page.keyboard.press('a');
  await expect(page.locator('canvas')).toHaveAttribute('data-interactions', '1');
  await expect(page.getByText('Little hands. Big wonder.')).not.toBeVisible();
  await page.keyboard.press('Backspace');
  await expect(page.locator('canvas')).toBeVisible();
  expect(errors).toEqual([]);
});
test('a tap cannot open parent controls; holding and the answer can', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Hold for 3 seconds for grown-ups' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await parents(page);
  await expect(page.getByRole('button', { name: 'Choose Bubble sea' })).toBeVisible();
  await page.getByRole('button', { name: 'Choose Peekaboo' }).click();
  await page.getByRole('button', { name: 'Back to play' }).click();
  await expect(page.locator('canvas')).toHaveAttribute('data-toy', 'peek');
  await page.keyboard.press('p');
  await expect(page.locator('canvas')).toHaveAttribute('data-discoveries', '1');
});
for (const toy of ['sea', 'bounce', 'paint', 'peek', 'garden', 'stars'])
  test(`${toy}: keys and touch work immediately`, async ({ page }) => {
    await setup(page, toy);
    const canvas = page.locator('canvas');
    await expect(canvas).toHaveAttribute('data-toy', toy);
    await page.keyboard.press('x');
    await expect
      .poll(async () => Number(await canvas.getAttribute('data-interactions')))
      .toBeGreaterThan(0);
    const before = Number(await canvas.getAttribute('data-interactions'));
    await canvas.click({ position: { x: 120, y: 230 } });
    await expect
      .poll(async () => Number(await canvas.getAttribute('data-interactions')))
      .toBeGreaterThan(before);
  });
test('dragging paints a continuous ribbon and never scrolls the page', async ({ page }) => {
  await setup(page, 'paint');
  const canvas = page.locator('canvas');
  await page.mouse.move(80, 230);
  await page.mouse.down();
  await page.mouse.move(300, 360, { steps: 20 });
  await page.mouse.up();
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-interactions')))
    .toBeGreaterThan(1);
  await expect(canvas).toHaveAttribute('data-fingers', '0');
  await page.mouse.wheel(0, 500);
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-interactions')))
    .toBeGreaterThan(2);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(
    true,
  );
});
test('multi-touch handles cancellation and leaves no stuck fingers', async ({ page }) => {
  await setup(page, 'bounce');
  const canvas = page.locator('canvas');
  // Browser-level multitouch, rather than mocked pointer capture.
  const session = await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: 100, y: 230, id: 1 },
      { x: 260, y: 370, id: 2 },
    ],
  });
  await expect(canvas).toHaveAttribute('data-fingers', '2');
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [
      { x: 150, y: 290, id: 1 },
      { x: 220, y: 410, id: 2 },
    ],
  });
  await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect(canvas).toHaveAttribute('data-fingers', '0');
});
test('calm mode and parent preferences survive reload', async ({ page }) => {
  await page.goto('/');
  await parents(page);
  await page.getByRole('button', { name: 'Play their way' }).click();
  await page.getByRole('button', { name: 'Toddler' }).click();
  await page.getByRole('switch', { name: 'Calmer movement' }).click();
  await page.getByRole('switch', { name: 'High contrast' }).click();
  await page.getByRole('button', { name: 'Back to play' }).click();
  await page.reload();
  await expect(page.locator('canvas')).toHaveAttribute('data-mode', 'toddler');
  await expect(page.locator('canvas')).toHaveAttribute('data-calm', 'true');
  await expect(page.locator('main')).toHaveClass(/dark/);
});
test('reduced motion and small screens are supported', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await setup(page);
  await expect(page.locator('canvas')).toHaveAttribute('data-calm', 'true');
  for (const size of [
    { width: 320, height: 568 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    await page.keyboard.press('b');
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth &&
          document.documentElement.scrollHeight <= innerHeight,
      ),
    ).toBe(true);
  }
});
test('all six toys also play in high contrast', async ({ page }) => {
  await page.goto('/');
  for (const toy of ['sea', 'bounce', 'paint', 'peek', 'garden', 'stars']) {
    await page.evaluate(
      ({ key, toy }) =>
        localStorage.setItem(key, JSON.stringify({ toy, contrast: true, sound: false })),
      { key: storageKey, toy },
    );
    await page.reload();
    await page.keyboard.press('a');
    await expect
      .poll(async () => Number(await page.locator('canvas').getAttribute('data-interactions')))
      .toBeGreaterThan(0);
    await expect(page.locator('main')).toHaveClass(/dark/);
  }
});
test('a real offline reload plays with no external requests', async ({
  page,
  context,
  baseURL,
}) => {
  const external: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith(baseURL!) && !r.url().startsWith('data:')) external.push(r.url());
  });
  await page.goto('/');
  await expect(page.locator('main')).toHaveAttribute('data-offline-ready', 'true');
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await page.keyboard.press('b');
  await expect(page.locator('canvas')).toHaveAttribute('data-interactions', '1');
  expect(external).toEqual([]);
});
test('a break freezes play until a grown-up resumes', async ({ page }) => {
  await page.clock.install();
  await setup(page, 'sea', { breakMinutes: 5 });
  await page.clock.runFor(100);
  await page.clock.fastForward(301000);
  await expect(page.getByText('A little time to rest.')).toBeVisible();
  await page.keyboard.press('b');
  await expect(page.locator('canvas')).toHaveAttribute('data-interactions', '0');
  const button = page.getByRole('button', { name: 'Hold for 3 seconds for grown-ups' });
  await button.focus();
  await page.keyboard.down('Space');
  await page.clock.runFor(3100);
  await page.keyboard.up('Space');
  await page.getByLabel('What is 7 + 5?').fill('12');
  await page.getByRole('button', { name: 'Open grown-up space' }).click();
  await page.getByRole('button', { name: 'Start fresh playtime' }).click();
  await expect(page.getByText('A little time to rest.')).not.toBeVisible();
  await page.keyboard.press('z');
  await expect(page.locator('canvas')).toHaveAttribute('data-interactions', '1');
});
