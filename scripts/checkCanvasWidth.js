import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', (msg) => console.log('PAGE:', msg.text()));
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForSelector('#menu-toggle-btn');

  const initialSizes = await page.evaluate(() => ({
    canvasWidth: document.getElementById('canvas-container')?.clientWidth ?? 0,
    leftWidth: document.getElementById('left-sidebar')?.clientWidth ?? 0,
    rightWidth: document.getElementById('right-sidebar')?.clientWidth ?? 0,
  }));
  console.log('Initial sizes:', initialSizes);

  await page.click('#menu-toggle-btn');
  await page.waitForTimeout(500);

  const collapsedSizes = await page.evaluate(() => ({
    canvasWidth: document.getElementById('canvas-container')?.clientWidth ?? 0,
    leftWidth: document.getElementById('left-sidebar')?.getBoundingClientRect().width ?? 0,
    rightWidth: document.getElementById('right-sidebar')?.getBoundingClientRect().width ?? 0,
    totalWidth: document.getElementById('app')?.clientWidth ?? 0,
    windowWidth: window.innerWidth,
  }));
  console.log('Collapsed sizes:', collapsedSizes);

  await browser.close();
}

run();
