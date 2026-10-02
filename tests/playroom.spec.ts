import { expect, test, type Page } from '@playwright/test';
const storageKey = 'keylab2-adventures-v5';
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
    for (const card of await page.locator('.game-card').all()) await expect(card).toBeInViewport();
    await open(page, name);
    await expect(page.locator('.game-heading h1')).toHaveText(name);
    await page.keyboard.press('g');
    await expect(page.getByRole('navigation', { name: 'Switch adventures' })).toBeVisible();
    await expect(page.locator('.game-body')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Home — choose another game' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByRole('button', { name: 'Home — choose another game' }).click();
    await expect(page.getByRole('heading', { name: 'Where shall we go?' })).toBeVisible();
    await expect(page.locator(`.game-card[data-game="${id}"]`)).toBeFocused();
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

test('sliding across the piano plays each new color once', async ({ page }) => {
  await setup(page);
  await open(page, 'Little music makers');
  const first = await page.getByRole('button', { name: 'Piano key 1', exact: true }).boundingBox();
  const fourth = await page.getByRole('button', { name: 'Piano key 4', exact: true }).boundingBox();
  await page.mouse.move(first!.x + first!.width / 2, first!.y + first!.height / 2);
  await page.mouse.down();
  await page.mouse.move(fourth!.x + fourth!.width / 2, fourth!.y + fourth!.height / 2, {
    steps: 24,
  });
  await page.mouse.up();
  await expect(page.getByTestId('music-game')).toHaveAttribute('data-notes-played', '4');
  await page.keyboard.press('x');
  await expect(page.getByTestId('music-game')).toHaveAttribute('data-notes-played', '5');
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
    await page.evaluate(() => window.scrollTo(0, 300));
    const home = page.getByRole('button', { name: 'Home — choose another game' });
    await expect(home).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await home.click();
  }
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

test('picture dock preserves play and freezes a song while exploring another game', async ({
  page,
}) => {
  await setup(page, { sound: true, narration: false });
  await open(page, 'Little music makers');
  await page.getByRole('button', { name: 'Listen', exact: true }).click();
  await expect
    .poll(async () =>
      Number(await page.getByTestId('music-game').getAttribute('data-notes-played')),
    )
    .toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Switch to Discovery safari', exact: true }).click();
  const notes = await page.getByTestId('music-game').getAttribute('data-notes-played');
  await page.getByRole('button', { name: 'A for Apple', exact: true }).click();
  await page.waitForTimeout(650);
  await expect(page.getByTestId('music-game')).toHaveAttribute('data-notes-played', notes!);
  await page.getByRole('button', { name: 'Switch to Little music makers', exact: true }).click();
  await expect(page.getByTestId('music-game')).toBeVisible();
  await expect(page.getByTestId('music-game')).toHaveAttribute('data-notes-played', notes!);
  await page.getByRole('button', { name: 'Switch to Discovery safari', exact: true }).click();
  await expect(page.getByTestId('discovery-game')).toHaveAttribute('data-phase', 'found');
  await page.getByRole('button', { name: 'Home — choose another game' }).click();
  await open(page, 'Discovery safari');
  await expect(page.getByTestId('discovery-game')).toHaveAttribute('data-phase', 'found');
});

test('English greetings work before the device returns its voice list', async ({ page }) => {
  await page.addInitScript(() => {
    const spoken: { text: string; lang: string }[] = [];
    Object.defineProperty(window, '__testSpoken', { value: spoken });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: class {
        text: string;
        constructor(text: string) {
          this.text = text;
        }
      },
    });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => [],
        speak: (utterance: { text: string; lang: string }) =>
          spoken.push({ text: utterance.text, lang: utterance.lang }),
        cancel: () => {},
        resume: () => {},
        paused: false,
      },
    });
  });
  await setup(page, { sound: true, name: 'Pip' });
  await page.getByRole('button', { name: 'Say hello to Pip' }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { __testSpoken: { text: string; lang: string }[] }).__testSpoken,
      ),
    )
    .toContainEqual({ text: 'Hello, Pip! I’m Pip. Let’s play!', lang: 'en-GB' });
  await parents(page);
  await page.getByLabel('Name for greetings').fill('Little Star');
  await page.getByRole('checkbox', { name: 'English words & greetings' }).uncheck();
  await page.getByRole('button', { name: 'Back to playing' }).click();
  const count = await page.evaluate(
    () => (window as unknown as { __testSpoken: unknown[] }).__testSpoken.length,
  );
  await page.getByRole('button', { name: 'Say hello to Pip' }).click();
  expect(
    await page.evaluate(
      () => (window as unknown as { __testSpoken: unknown[] }).__testSpoken.length,
    ),
  ).toBe(count);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Hello, Little Star!' })).toBeVisible();
});
