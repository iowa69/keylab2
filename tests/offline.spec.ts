import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import type { AddressInfo } from 'node:net';
import { test, expect } from '@playwright/test';

// A stopped origin tests real cache-only use in all engines. WebKit's emulated
// setOffline(true) rejects even service-worker responses (Playwright #42775).
test('all nine adventures reload and play with their origin server shut down', async ({ page }) => {
  const root = resolve('dist');
  const mime: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.webmanifest': 'application/manifest+json',
  };
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url!, 'http://localhost').pathname);
      const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(root + sep)) {
        response.writeHead(403).end();
        return;
      }
      const body = await readFile(file);
      response.writeHead(200, {
        'Content-Type': mime[extname(file)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((ready) => server.listen(0, '127.0.0.1', ready));
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    await page.addInitScript(() =>
      localStorage.setItem('keylab2-adventures-v5', JSON.stringify({ sound: false })),
    );
    await page.goto(origin);
    await expect(page.locator('main')).toHaveAttribute('data-offline-ready', 'true', {
      timeout: 20000,
    });
    await page.reload();
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await new Promise<void>((done) => {
      server.close(() => done());
      server.closeAllConnections();
    });
    await page.reload();
    await expect(page.locator('.game-card')).toHaveCount(9);
    const names = [
      'My little garage',
      'Jungle dash',
      'Space explorers',
      'The sweet shop',
      'Away we go!',
      'Discovery safari',
      'Little music makers',
      'Mischief meadow',
      'Fruit picnic',
    ];
    for (const name of names) {
      await page.getByRole('button', { name: `Play ${name}`, exact: true }).click();
      await expect(page.locator('.game-heading h1')).toHaveText(name);
      await page.keyboard.press('x');
      await page.getByRole('button', { name: 'Home — choose another game' }).click();
    }
    expect(
      await page.evaluate(() =>
        fetch('/definitely-not-cached').then(
          () => false,
          () => true,
        ),
      ),
    ).toBe(true);
  } finally {
    server.closeAllConnections();
    server.close();
  }
});
