const { chromium } = require('playwright');
const path = require('node:path');

const arg = (name, fallback) => process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : fallback;
const base = arg('--base', 'http://localhost:4173');
const out = arg('--out', path.resolve(__dirname, '../public/sheets/appartement-crans'));
const views = [
  { file: 'a10-xpanel-lighting', entry: 'main', width: 1280, height: 800, tab: 'lighting' },
  { file: 'a10-xpanel-shades', entry: 'main', width: 1280, height: 800, tab: 'shades' },
  { file: 'a10-xpanel-climate', entry: 'climate', width: 1280, height: 800, tab: 'climate' },
  { file: 'a10-ipad', entry: 'mobile', width: 1024, height: 768, tab: 'lighting' },
  { file: 'a10-iphone', entry: 'mobile', width: 440, height: 863, tab: 'lighting' },
];

(async () => {
  const browser = await chromium.launch();
  try {
    for (const { file, entry, width, height, tab } of views) {
      const page = await browser.newPage({ viewport: { width, height } });
      await page.goto(`${base}/showcases/appartement-crans/xpanels/${entry}.html`);
      await page.waitForFunction(() => window.A10Bench?.getState());
      if (tab === 'lighting') await page.getByRole('button', { name: 'Bright', exact: true }).click();
      if (tab === 'shades') await page.getByRole('button', { name: 'Shades', exact: true }).click();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(out, file + '.png') });
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
