// Requires Playwright and Chrome; start the site's local server before running.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const widths = [1440, 1366, 1201, 1200, 1100, 1025, 1024, 1000, 993, 992,
  900, 821, 820, 800, 769, 768, 767, 760, 700, 650, 641, 640, 600, 577,
  576, 500, 431, 430, 414, 391, 390, 375, 360];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.CASE_URL || 'http://localhost:8098/case.html');
    await page.waitForSelector('html.layout-is-ready', { state: 'attached' });
    await page.evaluate(() => document.fonts.ready);
    for (const variant of ['original', 'long-content']) {
      if (variant === 'long-content') {
        await page.evaluate(() => {
          document.querySelector('.case-detail__title').textContent =
            'Как мы организовали продвижение международной производственной компании и получили дополнительные обращения из нескольких регионов';
          for (let i = 0; i < 3; i++) {
            const tag = document.createElement('li');
            tag.textContent = 'Дополнительная площадка продвижения с длинным названием и особыми условиями размещения';
            document.querySelector('.case-detail__tags').append(tag);
          }
          const metrics = document.querySelector('.case-metrics');
          for (let i = 0; i < 2; i++) metrics.append(metrics.firstElementChild.cloneNode(true));
          const list = document.querySelector('.case-detail__section ul');
          for (let i = 0; i < 8; i++) {
            const item = document.createElement('li');
            item.textContent = 'Дополнительная строка нового кейса с описанием выполненной работы и полученных результатов';
            list.append(item);
          }
        });
      }
      for (const width of widths) {
        await page.setViewportSize({ width, height: 783 });
        await page.evaluate(() => new Promise(requestAnimationFrame));
        const issues = await page.evaluate(() => {
          const failures = [];
          const selectors = '.case-detail__article, .case-detail__article h1, .case-detail__article h2, .case-detail__article h3, .case-detail__article p, .case-detail__article ul, .case-metrics, .case-detail__figure, .case-detail__tags li, .site-footer__column, .site-footer__form, .site-footer__legal';
          for (const element of document.querySelectorAll(selectors)) {
            const rect = element.getBoundingClientRect();
            if (!rect.width || !rect.height) continue;
            const label = element.className || element.tagName;
            if (rect.left < -1 || rect.right > innerWidth + 1) failures.push(`${label}: outside viewport`);
            if (!element.matches('figure') && element.scrollWidth > element.clientWidth + 2) failures.push(`${label}: content overflow`);
          }
          const sections = [...document.querySelectorAll('.case-detail__article > header, .case-detail__article > section')];
          for (let i = 1; i < sections.length; i++) {
            if (sections[i].getBoundingClientRect().top < sections[i - 1].getBoundingClientRect().bottom - 1) failures.push('overlapping article sections');
          }
          return failures;
        });
        assert.deepEqual(issues, [], `${variant} at ${width}px`);
      }
    }
    assert.deepEqual(errors, [], 'JavaScript errors');
    console.log(`PASS: ${widths.length} widths, original and long-content variants.`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
