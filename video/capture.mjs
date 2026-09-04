import {chromium} from 'playwright';
import QRCode from 'qrcode';
import fs from 'node:fs/promises';

const OUT = new URL('./public/', import.meta.url);
await fs.mkdir(OUT, {recursive: true});

const browser = await chromium.launch({headless: true});
const context = await browser.newContext({
  viewport: {width: 1280, height: 1600},
  deviceScaleFactor: 1,
  locale: 'vi-VN',
});

const cleanPage = async (page) => {
  await page.addStyleTag({content: `
    iframe { display:none !important; }
    [class*="chat" i], [id*="chat" i], [class*="messenger" i], [class*="zalo" i] { display:none !important; }
    html { scroll-behavior: auto !important; }
  `}).catch(() => {});
};

const warmLazyImages = async (page) => {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y < max; y += 900) {
      window.scrollTo(0, y);
      await sleep(100);
    }
    window.scrollTo(0, 0);
  });
};

const shot = async (page, file, anchor = null) => {
  if (anchor) {
    const locator = page.getByText(anchor, {exact: false}).first();
    if (await locator.count()) {
      await locator.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(650);
      await page.evaluate(() => window.scrollBy(0, -190));
      await page.waitForTimeout(180);
    }
  } else {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);
  }
  await page.screenshot({path: new URL(file, OUT), fullPage: false, type: 'png'});
};

const landing = await context.newPage();
await landing.goto('https://biihappy.com/iwedding', {waitUntil: 'domcontentloaded', timeout: 90000});
await landing.waitForTimeout(1800);
await cleanPage(landing);
await warmLazyImages(landing);
await shot(landing, 'landing-hero.png');
await shot(landing, 'landing-platform.png', 'Khám phá nền tảng cưới thông minh iWedding');
await shot(landing, 'landing-templates.png', 'Top Giao Diện Website Cưới Xu Hướng 2026');
await shot(landing, 'landing-why.png', 'Vì sao iWedding là trợ lý cưới số 1');
await shot(landing, 'landing-steps.png', 'Sở hữu Website Cưới chỉ với 4 bước đơn giản');

const wedding = await context.newPage();
await wedding.goto('https://minhtienthanhlam.meliwedding.online/', {waitUntil: 'domcontentloaded', timeout: 90000});
await wedding.waitForTimeout(1800);
await cleanPage(wedding);
await warmLazyImages(wedding);
await shot(wedding, 'wedding-hero.png');
await shot(wedding, 'wedding-countdown.png', 'Wedding Countdown');
await shot(wedding, 'wedding-events.png', 'Sự Kiện Cưới');
await shot(wedding, 'wedding-album.png', 'Album Hình Cưới');
await shot(wedding, 'wedding-wishes.png', 'Sổ Lưu Bút');

await QRCode.toFile(new URL('qr-iwedding.png', OUT), 'https://biihappy.com/iwedding', {
  width: 720,
  margin: 2,
  errorCorrectionLevel: 'H',
  color: {dark: '#1D1A22', light: '#FFFDFB'},
});

await browser.close();
console.log('Captured live iWedding and public wedding-page visuals.');
