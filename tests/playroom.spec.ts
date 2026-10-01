import { expect, test, type Page } from '@playwright/test';
const storageKey = 'keylab2-adventures-v4';
const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const caught: string[] = [];
  errors.set(page, caught);
  page.on('pageerror', (e) => caught.push(e.message));
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([]);
});
async function setup(page: Page, settings: Record<string, unknown> = {}) {
  await page.addInitScript(
    ({ key, value }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value));
    },
    { key: storageKey, value: { sound: false, ...settings } },
  );
  await page.goto('/');
}
async function open(page: Page, name: string) {
  await page.getByRole('button', { name: `Play ${name}`, exact: true }).click();
}
async function parents(page: Page) {
  await page.getByRole('button', { name: 'Hold for grown-up settings' }).focus();
  await page.keyboard.down('Space');
  await page.waitForTimeout(2600);
  await page.keyboard.up('Space');
  await expect(page.getByRole('dialog')).toBeVisible();
}
async function visibility(page: Page, hidden: boolean) {
  await page.evaluate((h) => {
    Object.defineProperty(document, 'hidden', { value: h, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
  if (hidden) {
    await expect(page.locator('.game-body')).toHaveAttribute('inert', '');
    // CSS pause operations settle on the animation timeline's next frame.
    // Sample the frozen pose only after those pending operations have committed.
    await page.locator('.game-body').evaluate(async (element) => {
      await Promise.all(
        element.getAnimations({ subtree: true }).map((animation) => animation.ready),
      );
    });
  } else await expect(page.locator('.game-body')).not.toHaveAttribute('inert', '');
}
const games = [
  ['garage', 'My little garage'],
  ['runner', 'Jungle dash'],
  ['space', 'Space explorers'],
  ['treats', 'The sweet shop'],
  ['transport', 'Away we go!'],
  ['letters', 'Discovery safari'],
  ['music', 'Little music makers'],
  ['splash', 'Mischief meadow'],
  ['arcade', 'Fruit picnic'],
];
for (const [id, name] of games)
  test(`${name}: child chooses, plays and returns home`, async ({ page }) => {
    await setup(page);
    await expect(page.locator('.game-card')).toHaveCount(9);
    await open(page, name);
    await expect(page.locator('.game-heading h1')).toHaveText(name);
    await page.keyboard.press('g');
    await expect(page.locator('.game-body')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Home — choose another game' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByRole('button', { name: 'Home — choose another game' }).click();
    await expect(page.getByRole('heading', { name: 'Where shall we go?' })).toBeVisible();
    await expect(page.locator(`[data-game="${id}"]`)).toBeFocused();
  });
test('solar exploration connects fuel, flight, a real planet and a keepsake', async ({ page }) => {
  await setup(page);
  await open(page, 'Space explorers');
  await page.getByRole('button', { name: 'Explore Saturn', exact: true }).click();
  await page.getByRole('button', { name: 'Collect fuel star 1' }).click();
  await page.keyboard.press('x');
  await page.keyboard.press('y');
  await expect(page.getByTestId('space-game')).toHaveAttribute('data-phase', 'fly');
  await expect(page.getByRole('heading', { name: 'Hello, Saturn!' })).toBeVisible({
    timeout: 5000,
  });
  await expect(page.getByText('Look at those beautiful rings!')).toBeVisible();
  await page.getByRole('button', { name: 'Next planet' }).click();
  await expect(page.getByRole('heading', { name: 'Uranus', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Home — choose another game' }).click();
  await expect(page.locator('[data-game="space"] [aria-label="Adventure explored"]')).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-game="space"] [aria-label="Adventure explored"]')).toBeVisible();
});
test('ice cream and chocolate are made, decorated, and shared', async ({ page }) => {
  await setup(page);
  await open(page, 'The sweet shop');
  await page.getByRole('button', { name: 'Add strawberry scoop' }).click();
  await page.getByRole('button', { name: 'Add chocolate scoop' }).click();
  await page.keyboard.press('v');
  await page.getByRole('button', { name: 'Sprinkles', exact: true }).click();
  await page.getByRole('button', { name: 'Serve to our friend' }).click();
  await expect(page.getByTestId('treats-game')).toHaveAttribute('data-phase', 'yum');
  await expect(page.getByText('Yum, yum, yum!')).toBeVisible();
  await page.getByRole('button', { name: 'Make another' }).click();
  await page.getByRole('button', { name: 'Chocolate', exact: true }).click();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: /Pour chocolate/ }).click();
  await page.keyboard.press('c');
  await page.keyboard.press('x');
  await expect(page.getByTestId('treats-game')).toHaveAttribute('data-phase', 'yum');
});
test('a whole song is playable by any keys, with free play and song choice', async ({ page }) => {
  await setup(page);
  await open(page, 'Little music makers');
  await page.getByRole('button', { name: 'Piano key 4' }).click();
  await page.keyboard.press('z');
  await expect(page.getByTestId('music-game')).toHaveAttribute('data-notes-played', '2');
  for (let i = 0; i < 40; i++) await page.keyboard.press('x');
  await expect(page.getByRole('heading', { name: 'You played a whole song!' })).toBeVisible();
  await page.getByRole('button', { name: 'Play again' }).click();
  await expect(page.getByTestId('music-game')).toHaveAttribute('data-notes-played', '0');
  await page.getByRole('button', { name: 'Row your boat', exact: true }).click();
  await page.getByRole('button', { name: 'Free play', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Make your own music' })).toBeVisible();
  await page.getByRole('button', { name: 'Piano key 7' }).click();
  await expect(page.getByRole('button', { name: 'Piano key 7' })).toHaveClass(/active/);
});
test('listening pauses, and mute stops automatic song playback', async ({ page }) => {
  await setup(page, { sound: true });
  await open(page, 'Little music makers');
  await page.getByRole('button', { name: 'Listen', exact: true }).click();
  await expect
    .poll(async () =>
      Number(await page.getByTestId('music-game').getAttribute('data-notes-played')),
    )
    .toBeGreaterThan(0);
  await visibility(page, true);
  const notes = await page.getByTestId('music-game').getAttribute('data-notes-played');
  await page.waitForTimeout(800);
  await expect(page.getByTestId('music-game')).toHaveAttribute('data-notes-played', notes!);
  await visibility(page, false);
  await page.getByRole('button', { name: 'Turn sound off' }).click();
  await expect(page.getByRole('button', { name: 'Listen', exact: true })).toBeDisabled();
  const muted = await page.getByTestId('music-game').getAttribute('data-notes-played');
  await page.waitForTimeout(700);
  await expect(page.getByTestId('music-game')).toHaveAttribute('data-notes-played', muted!);
  await page.keyboard.press('x');
  await expect(page.getByTestId('music-game')).toHaveAttribute(
    'data-notes-played',
    String(Number(muted) + 1),
  );
});
test('rocket and treat animations freeze when play becomes hidden', async ({ page }) => {
  await setup(page);
  await open(page, 'Space explorers');
  for (const key of ['x', 'y', 'z']) await page.keyboard.press(key);
  await expect(page.getByTestId('space-game')).toHaveAttribute('data-phase', 'fly');
  await page.waitForTimeout(120);
  await visibility(page, true);
  const pose = () =>
    page.locator('.space-rocket').evaluate((el) => {
      const s = getComputedStyle(el);
      return [s.left, s.top, s.transform];
    });
  const frozen = await pose();
  await page.waitForTimeout(400);
  expect(await pose()).toEqual(frozen);
  await expect(page.getByTestId('space-game')).toHaveAttribute('data-phase', 'fly');
  await visibility(page, false);
  await expect(page.getByTestId('space-game')).toHaveAttribute('data-phase', 'visit');
  await page.getByRole('button', { name: 'Home — choose another game' }).click();
  await open(page, 'The sweet shop');
  for (let i = 0; i < 5; i++) await page.keyboard.press('x');
  await expect(page.getByTestId('treats-game')).toHaveAttribute('data-phase', 'serve');
  await visibility(page, true);
  const treat = () =>
    page.locator('.treat-product').evaluate((el) => {
      const s = getComputedStyle(el);
      return [s.left, s.transform, s.opacity];
    });
  const paused = await treat();
  await page.waitForTimeout(400);
  expect(await treat()).toEqual(paused);
  await visibility(page, false);
  await expect(page.getByTestId('treats-game')).toHaveAttribute('data-phase', 'yum');
});
test('mischief washes muddy friends and starts a fresh puddle', async ({ page }) => {
  await setup(page);
  await open(page, 'Mischief meadow');
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('x');
    await page.waitForTimeout(400);
  }
  await expect(page.getByLabel('3 of 3 friends washed')).toBeVisible();
  await page.getByRole('button', { name: 'New puddle' }).click();
  await expect(page.getByLabel('0 of 3 friends washed')).toBeVisible();
  await expect(page.locator('[data-friend]')).toHaveCount(3);
});
test('arcade catches a pictured order, serves it, then changes fruit', async ({ page }) => {
  await setup(page);
  await open(page, 'Fruit picnic');
  await expect
    .poll(
      async () => {
        const phase = await page.getByTestId('arcade-game').getAttribute('data-phase');
        if (phase === 'catch') {
          await page.keyboard.press('x');
          await page.waitForTimeout(140);
        }
        return phase;
      },
      { timeout: 17000, intervals: [120] },
    )
    .toBe('ready');
  await page.getByRole('button', { name: 'Serve the fruit picnic' }).click();
  await expect(page.getByTestId('arcade-game')).toHaveAttribute('data-phase', 'served');
  await page.getByRole('button', { name: 'Next fruit picnic' }).click();
  await expect(page.getByLabel('0 of 4 oranges collected')).toBeVisible();
});
test('short accidental parent tap preserves keyboard play; settings pause and persist', async ({
  page,
}) => {
  await setup(page);
  await open(page, 'Little music makers');
  await page.getByRole('button', { name: 'Hold for grown-up settings' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.keyboard.press('x');
  await expect(page.getByTestId('music-game')).toHaveAttribute('data-notes-played', '1');
  await parents(page);
  await page.keyboard.press('y');
  await expect(page.getByTestId('music-game')).toHaveAttribute('data-notes-played', '1');
  await page.getByRole('button', { name: 'I can do it!' }).click();
  await page.getByRole('checkbox', { name: /Calmer motion/ }).check();
  await page.getByRole('checkbox', { name: /Stronger outlines/ }).check();
  await page.getByRole('button', { name: 'Back to playing' }).click();
  await page.keyboard.press('x');
  await expect(page.getByTestId('music-game')).toHaveAttribute('data-notes-played', '2');
  await page.reload();
  await expect(page.locator('main')).toHaveClass(/calm/);
  await expect(page.locator('main')).toHaveClass(/contrast/);
  expect(
    await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).mode, storageKey),
  ).toBe('toddler');
});
test('small portrait keeps home reachable and prevents horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await setup(page);
  for (const name of [
    'Jungle dash',
    'The sweet shop',
    'Space explorers',
    'Little music makers',
    'Mischief meadow',
  ]) {
    await open(page, name);
    await page.mouse.wheel(0, 300);
    const home = page.getByRole('button', { name: 'Home — choose another game' });
    await expect(home).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await home.click();
  }
});
test('cached playground and all nine adventures work after an offline reload', async ({
  page,
  context,
}) => {
  await setup(page);
  await expect(page.locator('main')).toHaveAttribute('data-offline-ready', 'true', {
    timeout: 20000,
  });
  await page.reload();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.game-card')).toHaveCount(9);
  for (const name of [
    'My little garage',
    'Jungle dash',
    'Space explorers',
    'Little music makers',
  ]) {
    await open(page, name);
    await expect(page.locator('.game-heading h1')).toHaveText(name);
    await page.keyboard.press('x');
    await page.getByRole('button', { name: 'Home — choose another game' }).click();
  }
  await context.setOffline(false);
});
test('a custom car keeps its chosen parts while driving and delivering', async ({ page }) => {
  await setup(page);
  await open(page, 'My little garage');
  await page.getByRole('button', { name: 'Choose van', exact: true }).click();
  await page.getByRole('button', { name: 'Paint car blue', exact: true }).click();
  await page.getByRole('button', { name: 'Choose flower wheels', exact: true }).click();
  await expect(page.getByRole('img', { name: 'Blue van with flower wheels' })).toBeVisible();
  await page.getByRole('button', { name: 'Drive my car' }).click();
  await page.getByRole('button', { name: 'Accelerate. Tap or hold to drive' }).click();
  for (let i = 0; i < 14; i++) await page.keyboard.press('x');
  await expect(page.getByRole('heading', { name: 'A picnic for bunny!' })).toBeVisible();
  await expect(page.getByLabel('5 of 5 stars collected')).toBeVisible();
  await page.getByRole('button', { name: 'Drive again' }).click();
  await expect(page.getByRole('heading', { name: 'Take the picnic to bunny' })).toBeVisible();
  await page.getByRole('button', { name: 'Build a new car' }).click();
  await expect(page.getByRole('heading', { name: 'Pick your car' })).toBeVisible();
});
for (const vehicle of ['train', 'plane'])
  test(`${vehicle}: boards friends and delivers them to three places`, async ({ page }) => {
    await setup(page);
    await open(page, 'Away we go!');
    await page.getByRole('button', { name: `Choose the ${vehicle}` }).click();
    for (const friend of ['Fox', 'Chick', 'Elephant'])
      await page.getByRole('button', { name: `Board ${friend}`, exact: true }).click();
    for (const [friend, place] of [
      ['Fox', 'Apple farm'],
      ['Chick', 'Rainbow mountain'],
      ['Elephant', 'Sunny beach'],
    ]) {
      for (let i = 0; i < 5; i++) await page.keyboard.press('x');
      await page
        .getByRole('button', { name: `Let ${friend} off at ${place}`, exact: true })
        .click();
    }
    await expect(page.getByRole('heading', { name: 'Three very happy friends!' })).toBeVisible();
    await page.getByRole('button', { name: 'Take another trip' }).click();
    await expect(page.getByRole('heading', { name: 'Three friends need a ride' })).toBeVisible();
  });
test('the runner stays playable when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      return type === 'webgl' || type === 'webgl2'
        ? null
        : Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await setup(page);
  await open(page, 'Jungle dash');
  await expect(page.locator('.runner-flat-world')).toBeVisible();
  const player = page.locator('.runner-flat-player');
  await page.getByRole('button', { name: 'Move left', exact: true }).click();
  await expect
    .poll(async () => player.evaluate((el) => parseFloat((el as HTMLElement).style.left)))
    .toBeLessThan(50);
  await page.keyboard.press('x');
  await expect
    .poll(async () => player.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe('none');
  await page.getByRole('button', { name: 'Home — choose another game' }).click();
  await expect(page.locator('.game-card')).toHaveCount(9);
});
test('discovery fills pages of letters, numbers, and colors, with helpful baby matching', async ({
  page,
}) => {
  await setup(page);
  await open(page, 'Discovery safari');
  for (const [letter, name] of [
    ['A', 'Apple'],
    ['B', 'Butterfly'],
    ['C', 'Cat'],
  ]) {
    await page.getByRole('button', { name: `${letter} for ${name}`, exact: true }).click();
    if (letter !== 'C') await page.getByRole('button', { name: 'Find the next discovery' }).click();
  }
  await expect(page.getByTestId('discovery-game')).toHaveAttribute('data-phase', 'album');
  await page.getByRole('button', { name: 'Start a new discovery page' }).click();
  await expect(page.getByRole('button', { name: 'D for Dog', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Discover numbers' }).click();
  for (let i = 1; i <= 3; i++) {
    await page.getByRole('button', { name: `${i} friends`, exact: true }).click();
    if (i < 3) await page.getByRole('button', { name: 'Find the next discovery' }).click();
  }
  await expect(page.getByTestId('discovery-game')).toHaveAttribute('data-phase', 'album');
  await page.getByRole('button', { name: 'Discover colors' }).click();
  await page.getByRole('button', { name: 'Red paint', exact: true }).click();
  await expect(page.getByTestId('discovery-game')).toHaveAttribute('data-phase', 'found');
  await page.getByRole('button', { name: 'Find the next discovery' }).click();
  for (let i = 0; i < 3; i++) await page.keyboard.press('x');
  await expect(page.getByTestId('discovery-game')).toHaveAttribute('data-phase', 'found');
  await page.getByRole('button', { name: 'Discover numbers' }).click();
  await expect(page.getByTestId('discovery-game')).toHaveAttribute('data-phase', 'album');
});
test('rest counts active game time and can be restarted by a grown-up', async ({ page }) => {
  await page.clock.install();
  await setup(page, { breakMinutes: 5 });
  await page.clock.runFor(300000);
  await expect(page.getByRole('heading', { name: 'A little time to rest.' })).not.toBeVisible();
  await open(page, 'Little music makers');
  await page.clock.runFor(300000);
  await expect(page.getByRole('heading', { name: 'A little time to rest.' })).toBeVisible();
  await page.getByRole('button', { name: 'Hold for grown-up settings' }).focus();
  await page.keyboard.down('Space');
  await page.clock.runFor(2600);
  await page.keyboard.up('Space');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Start fresh playtime' }).click();
  await expect(page.getByRole('heading', { name: 'A little time to rest.' })).not.toBeVisible();
  await page.keyboard.press('x');
  await expect(page.getByTestId('music-game')).toHaveAttribute('data-notes-played', '1');
});
