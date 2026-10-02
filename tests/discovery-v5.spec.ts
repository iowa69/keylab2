import { expect, test } from '@playwright/test';
const words = [
  'Apple',
  'Butterfly',
  'Cat',
  'Dog',
  'Elephant',
  'Fish',
  'Giraffe',
  'Hedgehog',
  'Ice cream',
  'Jellyfish',
  'Kite',
  'Lion',
  'Moon',
  'Nest',
  'Orange',
  'Pear',
  'Queen',
  'Rabbit',
  'Strawberry',
  'Turtle',
  'Umbrella',
  'Volcano',
  'Whale',
  'Xylophone',
  'Yo-yo',
  'Zebra',
];
test('discovery has every English letter, illustrated choices, and a complete looping alphabet', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('keylab2-adventures-v5', JSON.stringify({ sound: false })),
  );
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Play Discovery safari', exact: true }).click();
  for (let index = 0; index < words.length; index++) {
    const letter = String.fromCharCode(65 + index);
    await expect(page.locator('.discovery-huge-letter')).toHaveText(letter);
    const choice = page.getByRole('button', { name: `${letter} for ${words[index]}`, exact: true });
    await expect(choice).toBeVisible();
    expect(
      await choice.locator('svg path, svg circle, svg ellipse, svg rect').count(),
    ).toBeGreaterThan(4);
    await choice.click();
    await expect(page.getByTestId('discovery-game')).toHaveAttribute(
      'data-phase',
      (index + 1) % 3 ? 'found' : 'album',
    );
    await page.keyboard.press('ArrowRight');
  }
  await expect(page.locator('.discovery-huge-letter')).toHaveText('A');
  expect(errors).toEqual([]);
});
