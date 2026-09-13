// Run with PLAYWRIGHT_MODULE pointing to an installed Playwright package.
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = 'http://localhost:8098';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fixture(page, reducedMotion = false) {
  await page.emulateMedia({ reducedMotion: reducedMotion ? 'reduce' : 'no-preference' });
  await page.route('**/__slider_test', route => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><meta name="viewport" content="width=device-width"><style>
      body{margin:0}.viewport{width:350px;margin:20px;overflow:hidden}
      ul{display:flex;gap:20px;padding:0;margin:0;list-style:none}
      li{flex:0 0 300px;height:200px;background:#965eeb}
      li a{display:block;height:200px} body{min-height:2200px}
      </style><button id="prev">Previous</button><button id="next">Next</button>
      <div class="viewport"><ul>${[0,1,2,3].map(i=>`<li data-slide><a href="#card-${i}">${i}</a></li>`).join('')}</ul></div>
      <script type="module">import {createLoopSlider} from '/js/utils/create-slider.js';
      window.slider=createLoopSlider(document.querySelector('.viewport'),{
        stableTrack:true,revealLeadingClones:true,
        previousButtons:document.querySelector('#prev'),nextButtons:document.querySelector('#next')
      });</script>`
  }));
  await page.goto(origin + '/__slider_test');
  await page.waitForFunction(() => window.slider);
}

async function pointer(page, type, x, y = 100, extra = {}) {
  await page.locator('.viewport').dispatchEvent(type, {
    pointerId: 1, pointerType: 'touch', isPrimary: true,
    clientX: x, clientY: y, bubbles: true, cancelable: true, ...extra
  });
}

async function swipe(page, delta, { cancel = false, hold = 0 } = {}) {
  await pointer(page, 'pointerdown', 200);
  for (let i = 1; i <= 5; i++) {
    await pointer(page, 'pointermove', 200 + delta * i / 5);
    await pause(16);
  }
  if (hold) await pause(hold);
  await pointer(page, cancel ? 'pointercancel' : 'pointerup', cancel ? 0 : 200 + delta);
}

async function settled(page) {
  await page.waitForFunction(() => {
    const root = document.querySelector('.viewport');
    return !root.classList.contains('is-animating') && !root.classList.contains('is-dragging');
  });
  // animateBack has no public animation class; allow its short transition.
  await pause(420);
}

async function engineChecks(page, name) {
  await fixture(page);
  await page.evaluate(() => {
    window.originalNodes = [...document.querySelector('ul').children];
    window.mutations = 0;
    new MutationObserver(records => window.mutations += records.length)
      .observe(document.querySelector('ul'), {childList:true});
  });
  await swipe(page, -150);
  await settled(page);
  assert.equal(await page.evaluate(() => slider.getActiveIndex()), 1, 'swipe advances');
  await swipe(page, 150);
  await settled(page);
  assert.equal(await page.evaluate(() => slider.getActiveIndex()), 0, 'reverse swipe');
  await swipe(page, 150);
  await settled(page);
  assert.equal(await page.evaluate(() => slider.getActiveIndex()), 3, 'backward loop');
  await swipe(page, -150);
  await settled(page);
  assert.equal(await page.evaluate(() => slider.getActiveIndex()), 0, 'forward loop');

  await page.evaluate(() => slider.move(1));
  await pause(90);
  // Capture and interrupt in the same task to detect a jump rather than time elapsed.
  const continuity = await page.evaluate(() => {
    const root = document.querySelector('.viewport');
    const x = () => new DOMMatrixReadOnly(getComputedStyle(root.firstElementChild).transform).m41;
    const before = x();
    root.dispatchEvent(new PointerEvent('pointerdown', {
      pointerId:1,pointerType:'touch',isPrimary:true,clientX:200,clientY:100,bubbles:true
    }));
    return Math.abs(x() - before);
  });
  assert.ok(continuity < 1, `interrupt continuity: ${continuity}`);
  await pointer(page, 'pointermove', 150);
  await pause(20);
  assert.equal(await page.locator('.viewport').evaluate(e => e.classList.contains('is-dragging')), true,
    'second swipe must be accepted during animation');
  await pointer(page, 'pointermove', 70);
  await pointer(page, 'pointerup', 70);
  await settled(page);
  assert.equal(await page.evaluate(() => slider.getActiveIndex()), 2, 'rapid swipes advance twice');

  // Change direction while the previous transition is still running.
  await page.evaluate(() => slider.move(1));
  await pause(90);
  await swipe(page, 150);
  await settled(page);
  assert.equal(await page.evaluate(() => slider.getActiveIndex()), 2, 'reverse during animation');

  await swipe(page, -130, {cancel:true});
  await settled(page);
  assert.equal(await page.evaluate(() => slider.getActiveIndex()), 2, 'cancel does not advance');
  await swipe(page, -10, {hold:160});
  await settled(page);
  assert.equal(await page.evaluate(() => slider.getActiveIndex()), 2, 'paused short drag snaps back');
  await pointer(page, 'pointerdown', 200);
  await pointer(page, 'pointermove', 203, 180);
  await pointer(page, 'pointercancel', 0, 0);
  assert.equal(await page.evaluate(() => slider.getActiveIndex()), 2, 'vertical gesture leaves slider alone');

  await page.evaluate(() => { slider.move(1); slider.move(1); slider.move(-1); });
  await pause(1200);
  assert.equal(await page.evaluate(() => slider.getActiveIndex()), 3, 'button queue');
  assert.equal(await page.evaluate(() => window.mutations), 0, 'no DOM rebuilds during swipes');
  await page.setViewportSize({width:390,height:700});
  await pause(100);
  assert.equal(await page.evaluate(() => window.mutations), 0, 'Safari chrome height resize does not rebuild');
  await page.setViewportSize({width:430,height:850});
  await pause(100);
  assert.equal(await page.evaluate(() => slider.getActiveIndex()), 3, 'width resize preserves active index');
  await fixture(page, true);
  await swipe(page, -150);
  assert.equal(await page.evaluate(() => slider.getActiveIndex()), 1, 'reduced motion');
  console.log(`${name}: engine checks passed`);
}

async function nativeTouchChecks(browser) {
  const context=await browser.newContext({viewport:{width:390,height:850},hasTouch:true,isMobile:true});
  const page=await context.newPage();
  await fixture(page);
  const client=await context.newCDPSession(page);
  const touch=async(type,x,y)=>client.send('Input.dispatchTouchEvent',{
    type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]
  });
  await touch('touchStart',270,110);
  for(let i=1;i<=8;i++) { await touch('touchMove',270-20*i,110); await pause(16); }
  await touch('touchEnd');
  await settled(page);
  assert.equal(await page.evaluate(()=>slider.getActiveIndex()),1,'native touch swipe advances');
  assert.equal(await page.evaluate(()=>location.hash),'','swipe does not activate link');
  const before=await page.evaluate(()=>scrollY);
  await touch('touchStart',200,210);
  for(let i=1;i<=6;i++) { await touch('touchMove',200,210-25*i); await pause(20); }
  await touch('touchEnd');
  await pause(350);
  assert.ok(await page.evaluate(()=>scrollY)>before+20,'native vertical gesture scrolls the page');
  assert.equal(await page.evaluate(()=>slider.getActiveIndex()),1,'vertical touch does not change slide');
  await page.evaluate(()=>scrollTo(0,0));
  await pause(100);
  await page.touchscreen.tap(160,110);
  assert.equal(await page.evaluate(()=>location.hash),'#card-1','normal tap still opens card');
  await context.close();
  console.log('Chromium: native touch, vertical scrolling, swipe click suppression and tap passed');
}

async function pageChecks(browser, name) {
  const context = await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const page = await context.newPage();
  const errors=[];
  page.on('pageerror', error=>errors.push(error.message));
  for (const file of ['index.html','avito.html']) {
    for (const width of [390,768,1440]) {
      await page.setViewportSize({width,height:900});
      await page.goto(`${origin}/${file}`);
      await page.waitForSelector('html.layout-is-ready', {state:'attached'});
      const sliders = page.locator('.is-loop-slider.is-swipe-enabled');
      assert.ok(await sliders.count() >= 2, 'expected enabled sliders');
      for (let i=0;i<await sliders.count();i++) {
        const root=sliders.nth(i);
        await root.scrollIntoViewIfNeeded();
        const before=await root.evaluate(e=>{
          const t=e.querySelector('ul');
          window.checkedTrack=t;
          window.checkedChildren=[...t.children];
          return t.querySelector('.is-active:not([data-loop-clone])')?.dataset.loopIndex ?? '0';
        });
        const box=await root.boundingBox();
        const x=Math.min(box.x+box.width-24,width-24), y=box.y+Math.min(120,box.height/2);
        await page.mouse.move(x,y);
        await page.mouse.down();
        await page.mouse.move(x-130,y,{steps:8});
        await page.mouse.up();
        await page.waitForTimeout(500);
        const result=await root.evaluate(e=>({
          active:e.querySelector('ul .is-active:not([data-loop-clone])')?.dataset.loopIndex ?? '0',
          sameNodes:checkedChildren.every((node,index)=>checkedTrack.children[index]===node),
          stuck:e.classList.contains('is-dragging')||e.classList.contains('is-animating'),
          touchAction:getComputedStyle(e).touchAction,
          filter:getComputedStyle(e.querySelector('ul > li')).filter
        }));
        assert.notEqual(result.active,before, `${file} ${width} slider ${i} changes`);
        assert.ok(result.sameNodes && !result.stuck, 'stable DOM and idle after gesture');
        assert.equal(result.filter,'none','no touch blur');
        assert.ok(result.touchAction.includes('pan-y'), 'vertical scrolling remains allowed');
      }
      console.log(`${name}: ${file} ${width}px passed`);
    }
  }
  assert.deepEqual(errors,[], 'no browser JS errors');
  await context.close();
}

(async()=>{
  let server;
  try {
    try { await fetch(origin + '/index.html'); }
    catch {
      server=spawn(process.execPath,['.codex-static-server.cjs'],{
        cwd:path.resolve(__dirname,'..'),windowsHide:true,stdio:'ignore'
      });
      await pause(1000);
    }
    for (const [name,type,options] of [['Chromium',chromium,{channel:'chrome'}],['WebKit',webkit,{}]]) {
      const browser=await type.launch(options);
      try {
        const page=await browser.newPage({viewport:{width:390,height:850},hasTouch:true});
        await engineChecks(page,name);
        await page.close();
        await pageChecks(browser,name);
        if (name==='Chromium') await nativeTouchChecks(browser);
      } finally { await browser.close(); }
    }
  } finally { server?.kill(); }
})().catch(error=>{ console.error(error); process.exitCode=1; });
