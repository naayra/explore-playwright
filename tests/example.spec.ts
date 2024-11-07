import { test, expect } from '@playwright/test';

declare global {
  interface Window {
    hello: string;
    config: {
      baseUrl: string;
      enable: () => boolean;
    };
    __injectEnable: () => boolean;
  }
}

test('inject to a window object', async ({ page }) => {
  await page.addInitScript(() => {
    window.hello = 'world';

    window.config = {
      baseUrl: 'https://example.com',
      enable: () => {
        return true;
      },
    };
  });

  await page.goto('https://playwright.dev/');

  const hello = await page.evaluate(() => window.hello);
  expect(hello).toBe('world');

  const config = await page.evaluate(() => window.config);
  console.log('config', config);
  expect(config.baseUrl).toBe('https://example.com');
  expect(config.enable()).toBe(true);
});

test('inject to a window object (method 2)', async ({ page }) => {
  await page.exposeFunction('__injectEnable', () => true);
  await page.addInitScript(() => {
    window.config = {
      baseUrl: 'https://example.com',
      enable: () => {
        return window.__injectEnable();
      },
    };
  });

  await page.goto('https://playwright.dev/');

  // it works
  const enable = await page.evaluate(() => window.config.enable());
  expect(enable).toBe(true);

  // doesn't work
  const config = await page.evaluate(() => window.config);
  console.log('config', config);
  expect(config.baseUrl).toBe('https://example.com');
  expect(config.enable()).toBe(true);
});
