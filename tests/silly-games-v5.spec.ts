import { expect, test, type Page } from '@playwright/test';
async function open(page: Page, name: string) {
  await page.addInitScript(() =>
    localStorage.setItem('keylab2-adventures-v5', JSON.stringify({ sound: false })),
  );
  await page.goto('/');
  await page.getByRole('button', { name: `Play ${name}`, exact: true }).click();
}
test('sweet shop stacks a huge treat, reacts to silly food, and feeds another friend', async ({
  page,
}) => {
  await open(page, 'The sweet shop');
  const game = page.getByTestId('treats-game');
  for (let i = 0; i < 18; i++)
    await page.getByRole('button', { name: 'Add strawberry scoop', exact: true }).click();
  await expect(game).toHaveAttribute('data-scoops', '18');
  await expect(
    page.getByRole('button', { name: 'Add strawberry scoop', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Silly toppings', exact: true }).click();
  await page.getByRole('button', { name: 'Add pickle', exact: true }).click();
  await page.getByRole('button', { name: 'Serve to our friend', exact: true }).click();
  await expect(game).toHaveAttribute('data-phase', 'yuck');
  await page.getByRole('button', { name: 'Make another treat', exact: true }).click();
  await expect(game).toHaveAttribute('data-scoops', '0');
  await page.getByRole('button', { name: 'Make chocolate', exact: true }).click();
  await page.getByRole('button', { name: /^Scoops/ }).click();
  for (let i = 0; i < 18; i++)
    await page.getByRole('button', { name: 'Add chocolate scoop', exact: true }).click();
  await expect(page.locator('.sweet-creation [data-chocolate-piece="filled"]')).toHaveCount(18);
});
test('sweet shop touch ingredients drag onto dessert once and canceled drags do not add', async ({
  page,
}) => {
  await open(page, 'The sweet shop');
  const ingredient = page.getByRole('button', { name: 'Add blueberry scoop', exact: true });
  const source = await ingredient.boundingBox(),
    target = await page.locator('.sweet-creation').boundingBox();
  expect(source).toBeTruthy();
  expect(target).toBeTruthy();
  await ingredient.dispatchEvent('pointerdown', {
    pointerId: 4,
    pointerType: 'touch',
    clientX: source!.x + 20,
    clientY: source!.y + 20,
  });
  await ingredient.dispatchEvent('pointermove', {
    pointerId: 4,
    pointerType: 'touch',
    clientX: target!.x + target!.width / 2,
    clientY: target!.y + target!.height / 2,
  });
  await ingredient.dispatchEvent('pointerup', {
    pointerId: 4,
    pointerType: 'touch',
    clientX: target!.x + target!.width / 2,
    clientY: target!.y + target!.height / 2,
  });
  await expect(page.getByTestId('treats-game')).toHaveAttribute('data-scoops', '1');
  await ingredient.dispatchEvent('pointerdown', {
    pointerId: 5,
    pointerType: 'touch',
    clientX: source!.x + 20,
    clientY: source!.y + 20,
  });
  await ingredient.dispatchEvent('pointercancel', { pointerId: 5, pointerType: 'touch' });
  await expect(page.getByTestId('treats-game')).toHaveAttribute('data-scoops', '1');
});
test('meadow water cleans, silly spray decorates, themes change and mud returns', async ({
  page,
}) => {
  await open(page, 'Mischief meadow');
  const game = page.getByTestId('splash-game');
  for (const name of ['Pig', 'Duck', 'Bunny']) {
    const target = page.getByRole('button', { name: new RegExp(`^${name},`) });
    await target.focus();
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(360);
    }
  }
  await expect(game).toHaveAttribute('data-clean', '3');
  await page.getByRole('button', { name: 'Spray silly wee', exact: true }).click();
  await page.getByRole('button', { name: /^Pig,/ }).focus();
  await page.keyboard.press('Enter');
  await expect(game).toHaveAttribute('data-clean', '2');
  await expect(page.locator('.splash-hidden-boy')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Pig,/ }).locator('.splash-boo')).toContainText(
    'Boo!',
  );
  await page.getByRole('button', { name: /^Change meadow theme/ }).click();
  await expect(game).toHaveAttribute('data-theme', '1');
  await page.getByRole('button', { name: 'New muddy puddle', exact: true }).click();
  await expect(game).toHaveAttribute('data-clean', '0');
  await page.getByRole('button', { name: 'Spray rainbow', exact: true }).click();
  await expect(game).toHaveAttribute('data-spray', 'rainbow');
});
test('picnic friends respond and the fruit still reaches Bear', async ({ page }) => {
  await open(page, 'Fruit picnic');
  await page.getByRole('button', { name: 'Say hello to Bear', exact: true }).click();
  await expect(page.locator('.picnic-bear')).toHaveClass(/picnic-bear-waving/);
  await page.getByRole('button', { name: 'Say hello to Butterfly', exact: true }).click();
  await expect(page.locator('.picnic-butterfly')).toHaveClass(/picnic-butterfly-hello/);
  for (
    let i = 0;
    i < 55 && (await page.getByTestId('arcade-game').getAttribute('data-phase')) === 'catch';
    i++
  ) {
    await page.keyboard.press('g');
    await page.waitForTimeout(130);
  }
  await expect(page.getByTestId('arcade-game')).toHaveAttribute('data-phase', 'ready');
  await page.getByRole('button', { name: 'Serve the fruit picnic', exact: true }).click();
  await expect(page.getByTestId('arcade-game')).toHaveAttribute('data-phase', 'served');
  await page.getByRole('button', { name: 'Next fruit picnic', exact: true }).click();
  await expect(page.getByTestId('arcade-game')).toHaveAttribute('data-phase', 'catch');
});
