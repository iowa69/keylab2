import { expect, test, type Page } from '@playwright/test';
async function open(page: Page, name: string) {
  await page.addInitScript(() =>
    localStorage.setItem('keylab2-adventures-v4', JSON.stringify({ sound: false, mode: 'baby' })),
  );
  await page.goto('/');
  await page.getByRole('button', { name: `Play ${name}`, exact: true }).click();
}
async function frozen(page: Page, hidden: boolean) {
  await page.evaluate((hidden) => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: hidden });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
}
test('space: steer, collect, hear a planet and continue exploring', async ({ page }) => {
  await open(page, 'Space explorers');
  await page.getByRole('button', { name: 'Explore Saturn', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Saturn', exact: true })).toBeVisible();
  const rocket = page.getByTestId('space-rocket');
  await page.getByRole('button', { name: 'Steer rocket left', exact: true }).click();
  await expect.poll(async () => Number(await rocket.getAttribute('data-x'))).toBeLessThan(40);
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => Number(await rocket.getAttribute('data-x'))).toBeGreaterThan(45);
  const field = page.locator('.space-flight-field');
  const bounds = (await field.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * 0.76, bounds.y + bounds.height * 0.35, {
    steps: 8,
  });
  await page.mouse.up();
  await expect.poll(async () => Number(await rocket.getAttribute('data-x'))).toBeGreaterThan(65);
  for (let i = 0; i < 6; i++) await page.keyboard.press('x');
  await expect(page.getByTestId('space-game')).toHaveAttribute('data-phase', 'visit');
  await expect(page.getByText('Saturn has beautiful rings.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hear about Saturn', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next planet', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Uranus', exact: true })).toBeVisible();
  await expect(page.getByTestId('space-game')).toHaveAttribute('data-fuel', '0');
  for (let i = 0; i < 6; i++) await page.keyboard.press('q');
  await expect(page.getByTestId('space-game')).toHaveAttribute('data-phase', 'visit');
  await expect(page.getByText('2 / 8 worlds', { exact: true })).toBeVisible();
});
test('space: dragging from a star steers without collecting, while tapping still collects', async ({
  page,
}) => {
  // Hold the moving scenery still while choosing the gesture's origin. This
  // reproduces a star drifting under a child's finger without timing luck.
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await open(page, 'Space explorers');
  await page.clock.pauseAt(new Date('2026-01-01T01:00:00Z'));
  await page.getByRole('button', { name: 'Explore Saturn', exact: true }).click();
  const field = (await page.locator('.space-flight-field').boundingBox())!;
  const star = page.getByRole('button', { name: 'Collect fuel star 1', exact: true });
  const origin = (await star.boundingBox())!;
  await page.mouse.move(origin.x + origin.width / 2, origin.y + origin.height / 2);
  await page.mouse.down();
  await page.mouse.move(field.x + field.width * 0.8, field.y + field.height * 0.35, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(page.getByTestId('space-game')).toHaveAttribute('data-fuel', '0');
  await page.clock.runFor(400);
  expect(Number(await page.getByTestId('space-rocket').getAttribute('data-x'))).toBeGreaterThan(65);
  await star.click();
  await expect(page.getByTestId('space-game')).toHaveAttribute('data-fuel', '1');
  await page.getByRole('button', { name: 'Steer rocket left', exact: true }).click();
  await page.clock.runFor(400);
  expect(Number(await page.getByTestId('space-rocket').getAttribute('data-x'))).toBeLessThan(70);
});
test('space: hidden flight freezes and resumes without a time jump', async ({ page }) => {
  await open(page, 'Space explorers');
  await page.waitForTimeout(300);
  await frozen(page, true);
  await page.waitForTimeout(120);
  const game = page.getByTestId('space-game');
  const time = await game.getAttribute('data-time');
  await page.waitForTimeout(650);
  await expect(game).toHaveAttribute('data-time', time!);
  await frozen(page, false);
  await expect
    .poll(async () => Number(await game.getAttribute('data-time')))
    .toBeGreaterThan(Number(time));
});
test('runner: peekaboo gives a friend, a letter and a helpful jump', async ({ page }) => {
  await open(page, 'Jungle dash');
  const peek = page.getByRole('button', { name: 'Play peekaboo with cat', exact: true });
  // Observe the short greeting before tapping: CI trace capture can outlast it
  // when assertions are sent sequentially after the input has already happened.
  await Promise.all([
    expect(page.locator('.runner-heading p')).toHaveText('Peekaboo! C is for cat!'),
    expect(peek).toHaveAttribute('aria-pressed', 'true'),
    expect(page.locator('.runner-peek-friend b')).toHaveText('C'),
    peek.click(),
  ]);
  await expect
    .poll(async () => Number(await page.getByTestId('runner-game').getAttribute('data-treasures')))
    .toBeGreaterThan(0);
  await expect(page.locator('.runner-word')).toBeVisible();
  await page.getByRole('button', { name: 'Jump', exact: true }).click();
  await page.keyboard.press('x');
  await frozen(page, true);
  await page.waitForTimeout(120);
  const game = page.getByTestId('runner-game'),
    time = await game.getAttribute('data-time');
  await page.waitForTimeout(500);
  await expect(game).toHaveAttribute('data-time', time!);
  await frozen(page, false);
  await expect
    .poll(async () => Number(await game.getAttribute('data-time')))
    .toBeGreaterThan(Number(time));
});
test('runner continues through the rainbow with varied treasures', async ({ page }) => {
  test.setTimeout(45000);
  await open(page, 'Jungle dash');
  const game = page.getByTestId('runner-game');
  await expect
    .poll(async () => Number(await game.getAttribute('data-trips')), { timeout: 35000 })
    .toBeGreaterThan(0);
  await expect(game).toHaveAttribute('data-island', '1');
  await expect(page.locator('.runner-island-badge')).toHaveText('Candy clouds');
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(
    true,
  );
});
test('touchscreen steers the rocket and collects a star without scrolling', async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.use.hasTouch, 'A real touch-capable browser context is required.');
  await open(page, 'Space explorers');
  const field = (await page.locator('.space-flight-field').boundingBox())!;
  await page.touchscreen.tap(field.x + field.width * 0.91, field.y + field.height * 0.47);
  await expect
    .poll(async () => Number(await page.getByTestId('space-rocket').getAttribute('data-x')))
    .toBeGreaterThan(75);
  const assist = (await page
    .getByRole('button', { name: 'Help rocket catch a star' })
    .boundingBox())!;
  await page.touchscreen.tap(assist.x + assist.width / 2, assist.y + assist.height / 2);
  await expect
    .poll(async () => Number(await page.getByTestId('space-game').getAttribute('data-fuel')))
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => scrollY)).toBe(0);
});
test('runner remains playable when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof getContext>
    ) {
      if (String(args[0]).includes('webgl')) return null;
      return getContext.apply(this, args);
    } as typeof getContext;
  });
  await open(page, 'Jungle dash');
  await expect(page.locator('.runner-flat-world')).toBeVisible();
  await page.getByRole('button', { name: 'Jump', exact: true }).click();
  await expect
    .poll(async () => Number(await page.getByTestId('runner-game').getAttribute('data-treasures')))
    .toBeGreaterThan(0);
  await expect(page.locator('.runner-word')).toBeVisible();
});
test('runner keeps travel speed with sparse animation frames and excludes a pause', async ({
  page,
}) => {
  await page.addInitScript(() => {
    // A slow-device cadence, without depending on the CI machine's GPU workload.
    window.requestAnimationFrame = (callback) =>
      window.setTimeout(() => callback(performance.now()), 125);
    window.cancelAnimationFrame = (id) => window.clearTimeout(id);
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof getContext>
    ) {
      if (String(args[0]).includes('webgl')) return null;
      return getContext.apply(this, args);
    } as typeof getContext;
  });
  await open(page, 'Jungle dash');
  const game = page.getByTestId('runner-game');
  await expect(page.locator('.runner-flat-world')).toBeVisible();
  const before = Number(await game.getAttribute('data-time'));
  await page.waitForTimeout(1800);
  expect(Number(await game.getAttribute('data-time')) - before).toBeGreaterThan(1.3);
  await frozen(page, true);
  const stopped = await game.getAttribute('data-time');
  await page.waitForTimeout(800);
  await expect(game).toHaveAttribute('data-time', stopped!);
  await frozen(page, false);
  await expect
    .poll(async () => Number(await game.getAttribute('data-time')))
    .toBeGreaterThan(Number(stopped));
  expect(Number(await game.getAttribute('data-time')) - Number(stopped)).toBeLessThan(0.6);
});
