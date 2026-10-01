import { expect, test } from '@playwright/test';

test('all six worlds respond to keys and can be cleared', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  for (const name of [
    'Letter Garden',
    'Bubble Bay',
    'Number Space',
    'Melody Meadow',
    'Shape Party',
    'Little Friends',
  ]) {
    await page.getByRole('button', { name: `Play ${name}`, exact: true }).click();
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    await page.keyboard.press('a');
    await expect(page.getByTestId('toy')).toHaveCount(1);
    await page.getByRole('button', { name: 'Clear the playground' }).click();
    await expect(page.getByTestId('toy')).toHaveCount(0);
    await page.getByRole('button', { name: 'All little worlds' }).click();
  }
  expect(errors).toEqual([]);
});

test('letter challenges encourage exploration and advance on the target', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Play Letter Garden', exact: true }).click();
  await page.getByRole('button', { name: 'Little challenge', exact: true }).click();
  await expect(page.getByText('Can you find the letter A?')).toBeVisible();
  await page.keyboard.press('x');
  await expect(page.getByTestId('toy')).toHaveCount(1);
  await expect(page.getByText('Can you find the letter A?')).toBeVisible();
  await page.getByRole('button', { name: 'Play A', exact: true }).click();
  await expect(page.getByText('You did it, little explorer!')).toBeVisible();
  await expect(page.getByText('Can you find the letter B?')).toBeVisible({ timeout: 5000 });
});

test('numbers produce the exact count and bubbles can be popped', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Play Number Space', exact: true }).click();
  await page.getByRole('button', { name: 'Play 5', exact: true }).click();
  await expect(page.getByTestId('toy')).toHaveCount(5);
  await page.getByRole('button', { name: 'All little worlds' }).click();
  await page.getByRole('button', { name: 'Play Bubble Bay', exact: true }).click();
  await page.getByRole('button', { name: 'Play A', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pop bubble A' })).toBeVisible();
  // Dispatch a real pointer click without waiting for a moving bubble to settle.
  const bubble = await page.getByRole('button', { name: 'Pop bubble A' }).boundingBox();
  await page.mouse.click(bubble!.x + bubble!.width / 2, bubble!.y + bubble!.height / 2);
  await expect(page.getByTestId('toy')).toHaveCount(0);
});

test('pause stops input and keyboard smashing stays bounded', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Play Shape Party', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByText('A little pause.', { exact: true })).toBeVisible();
  await page.keyboard.press('a');
  await expect(page.getByTestId('toy')).toHaveCount(0);
  await page.getByRole('button', { name: 'Keep playing' }).click();
  await page.evaluate(async () => {
    for (let i = 0; i < 60; i++) {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: String.fromCharCode(65 + (i % 26)),
          bubbles: true,
          cancelable: true,
        }),
      );
      await new Promise((resolve) => setTimeout(resolve, 45));
    }
  });
  expect(await page.getByTestId('toy').count()).toBeLessThanOrEqual(36);
  expect(await page.getByTestId('toy').count()).toBeGreaterThan(20);
  await page.keyboard.press('Backspace');
  await expect(page.getByRole('heading', { name: 'Shape Party', exact: true })).toBeVisible();
});

test('grown-up gate protects settings and saved preferences persist', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Grown-ups', exact: true }).click();
  const hold = page.getByRole('button', { name: 'Hold for 3 seconds to continue' });
  await hold.focus();
  await page.keyboard.down('Space');
  await page.waitForTimeout(3150);
  await page.keyboard.up('Space');
  await page.getByLabel('What is 7 + 5?').fill('12');
  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.getByRole('switch', { name: 'Calm mode' }).click();
  await page.getByRole('switch', { name: 'Play sounds' }).click();
  await page.getByLabel('A gentle break').selectOption('5');
  await page.getByRole('button', { name: 'All set. Let’s play.' }).click();
  await page.reload();
  await expect(page.locator('.app')).toHaveClass(/calm/);
  await expect(page.getByRole('button', { name: 'Turn on sounds' })).toBeVisible();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('keylab2-settings')!).breakMinutes),
  ).toBe(5);
});

test('fully loaded playground works offline without third-party requests', async ({
  page,
  context,
  baseURL,
}) => {
  const external: string[] = [];
  page.on('request', (req) => {
    if (!req.url().startsWith(baseURL!) && !req.url().startsWith('data:')) external.push(req.url());
  });
  await page.goto('/');
  await expect(page.getByText('Ready for offline play')).toBeVisible({ timeout: 15000 });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
          once: true,
        }),
      );
  });
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: 'Play Little Friends', exact: true }).click();
  await page.getByRole('button', { name: 'Play A', exact: true }).click();
  await expect(page.getByTestId('toy')).toHaveCount(1);
  expect(external).toEqual([]);
});

test('fits the viewport and respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.app')).toHaveClass(/calm/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Play Letter Garden', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('gentle break timer pauses active play', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('keylab2-settings', JSON.stringify({ breakMinutes: 5, sound: false })),
  );
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: 'Play Letter Garden', exact: true }).click();
  await page.clock.runFor(301000);
  await expect(page.getByText('Time for a little stretch.')).toBeVisible();
  await page.getByRole('button', { name: 'Start a fresh playtime' }).click();
  await expect(page.getByText('Time for a little stretch.')).not.toBeVisible();
});
