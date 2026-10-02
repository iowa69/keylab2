import { expect, test, type Page } from '@playwright/test';
async function enter(page: Page, name: string) {
  await page.addInitScript(() =>
    localStorage.setItem('keylab2-adventures-v5', JSON.stringify({ sound: false })),
  );
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: `Play ${name}`, exact: true }).click();
}
async function dragFriend(page: Page, name: string, seat: number) {
  const source = await page
    .getByRole('button', { name: `Board ${name}`, exact: true })
    .boundingBox();
  const target = await page.locator(`[data-coach-seat="${seat}"]`).boundingBox();
  await page.mouse.move(source!.x + source!.width / 2, source!.y + source!.height / 2);
  await page.mouse.down();
  await page.mouse.move(target!.x + target!.width / 2, target!.y + target!.height / 2, {
    steps: 8,
  });
  await page.mouse.up();
}
test('garage customization survives switching and the road keeps exploring', async ({ page }) => {
  test.setTimeout(60000);
  await enter(page, 'My little garage');
  await page.getByRole('button', { name: 'Choose van', exact: true }).click();
  await page.getByRole('tab', { name: 'Color', exact: true }).click();
  await page.getByRole('button', { name: 'Paint purple', exact: true }).click();
  await page.getByRole('tab', { name: 'Hat', exact: true }).click();
  await page.getByRole('button', { name: 'Choose rocket hat', exact: true }).click();
  await page.getByRole('button', { name: "Let's drive", exact: true }).click();
  await page.getByRole('button', { name: 'Choose teddy', exact: true }).click();
  await page.getByRole('button', { name: 'Throw teddy from the window', exact: true }).click();
  await expect(page.locator('.vg-flying-toy')).toHaveCount(1);
  await page.getByRole('button', { name: 'Say hello to Fox', exact: true }).click();
  await expect(page.locator('.vg-friend-button')).toContainText('Hello!');
  await page.keyboard.press('g');
  await expect(page.locator('.vg-flying-toy')).toHaveCount(2);
  await page.getByRole('button', { name: 'Switch to Away we go!', exact: true }).click();
  const parked = await page.locator('.vg-garage').getAttribute('data-distance');
  await page.waitForTimeout(350);
  await expect(page.locator('.vg-garage')).toHaveAttribute('data-distance', parked!);
  await page.getByRole('button', { name: 'Switch to My little garage', exact: true }).click();
  await page.clock.runFor(24500);
  await expect(page.locator('.vg-garage')).toHaveAttribute('data-world', '2');
  await expect(page.getByRole('button', { name: 'Pause driving', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back to garage', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Choose rocket hat', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('tab', { name: 'Color', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Paint purple', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});
test('train drag and drop, individual tastes, silly bin and rooftop cat', async ({ page }) => {
  await enter(page, 'Away we go!');
  await page.getByRole('button', { name: 'Choose train', exact: true }).click();
  await dragFriend(page, 'Chick', 0);
  await dragFriend(page, 'Fox', 1);
  await dragFriend(page, 'Elephant', 2);
  await expect(page.locator('[data-coach-seat="0"]')).toHaveAccessibleName('Garden coach 1, Chick');
  await expect(page.locator('.vg-transport')).toHaveAttribute('data-boarded', '3');
  await page.getByRole('button', { name: 'Start train journey', exact: true }).click();
  await page.getByRole('button', { name: 'Collect apple', exact: true }).click();
  await page.locator('[data-coach-seat="0"]').click();
  await expect(page.locator('[data-coach-seat="0"]')).toContainText('No, thank you!');
  await page.getByRole('button', { name: 'Collect apple', exact: true }).click();
  await page.locator('[data-coach-seat="1"]').click();
  await expect(page.locator('[data-coach-seat="1"]')).toContainText('Yummy!');
  await expect(page.locator('.vg-transport')).toHaveAttribute('data-meals', '1');
  await page.getByRole('button', { name: 'Collect poop', exact: true }).click();
  await page.getByRole('button', { name: 'Put it in the bin', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Feed with poop, 0 collected', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Pet the rooftop cat', exact: true }).click();
  await expect(page.locator('.vg-cat-speech')).toHaveText('Meow!');
});
test('plane accepts tap seating, touch snack sharing and a continuing journey', async ({
  page,
  isMobile,
}) => {
  await enter(page, 'Away we go!');
  await page.getByRole('button', { name: 'Choose plane', exact: true }).click();
  const friend = page.getByRole('button', { name: 'Board Elephant', exact: true });
  if (isMobile) await friend.tap();
  else await friend.click();
  const seat = page.locator('[data-coach-seat="0"]');
  if (isMobile) await seat.tap();
  else await seat.click();
  await expect(seat).toHaveAccessibleName('Garden coach 1, Elephant');
  await page.getByRole('button', { name: 'Start plane journey', exact: true }).click();
  await page.getByRole('button', { name: 'Collect banana', exact: true }).click();
  await seat.click();
  await expect(page.locator('.vg-transport')).toHaveAttribute('data-meals', '1');
  await page.getByRole('button', { name: 'Change passengers', exact: true }).click();
  await dragFriend(page, 'Elephant', 2);
  await expect(page.locator('[data-coach-seat="0"]')).toHaveAttribute('data-empty', 'true');
  await expect(page.locator('[data-coach-seat="2"]')).toHaveAccessibleName(
    'Ocean coach 3, Elephant',
  );
  await expect(page.locator('.vg-transport')).toHaveAttribute('data-boarded', '1');
});
test('small screen vehicle controls remain fully inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await enter(page, 'My little garage');
  for (const tab of ['Shape', 'Color', 'Wheels', 'Hat', 'Sticker']) {
    await page.getByRole('tab', { name: tab, exact: true }).click();
    await expect(page.getByRole('button', { name: "Let's drive", exact: true })).toBeInViewport();
  }
  await page.getByRole('button', { name: "Let's drive", exact: true }).click();
  await expect(page.locator('.vg-custom-car')).toBeInViewport({ ratio: 1 });
  await expect(
    page.getByRole('button', { name: 'Throw bubbles from the window', exact: true }),
  ).toBeInViewport({ ratio: 1 });
  await page.getByRole('button', { name: 'Switch to Away we go!', exact: true }).click();
  await page.getByRole('button', { name: 'Choose train', exact: true }).click();
  await page.getByRole('button', { name: 'Start train journey', exact: true }).click();
  for (const item of await page
    .locator('.vg-transport .vg-floating-food, .vg-transport .vg-controls > button')
    .all())
    await expect(item).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => document.documentElement.scrollHeight === innerHeight)).toBe(
    true,
  );
});

test('keyboard assistance feeds a lone passenger in any coach', async ({ page }) => {
  await enter(page, 'Away we go!');
  await page.getByRole('button', { name: 'Choose train', exact: true }).click();
  await dragFriend(page, 'Chick', 1);
  await page.getByRole('button', { name: 'Start train journey', exact: true }).click();
  for (let i = 0; i < 6; i++) await page.keyboard.press('x');
  await expect(page.locator('.vg-transport')).toHaveAttribute('data-meals', '3');
  await expect(page.locator('[data-coach-seat="1"]')).toContainText('Yummy!');
});
