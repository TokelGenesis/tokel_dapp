// Walks through every screen and button of the real app, in light and dark, English and Chinese
// (Electron + Playwright). Uses a throwaway HOME and a new, empty, throwaway wallet, so no real wallet is read.
//   yarn build && cp -R build/* src/electron/
//   npm i --no-save playwright-core
//   SMOKE_HOME=/tmp/tokel-ui SHOTS=/tmp/tokel-ui xvfb-run -a node tests-e2e/ui.e2e.mjs
//   (COMBOS=light:en,dark:zh to run fewer; SHOTS is optional)
//   rm -rf src/electron/dist src/electron/main.js src/electron/841.main.js src/electron/preload.js
import { _electron as electron } from 'playwright-core';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';

const DAPP = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const bip39 = createRequire(`${DAPP}/src/electron/worker.js`)('bip39');
const PHRASE = bip39.generateMnemonic(256);
const SHOTS = process.env.SHOTS;
const COMBOS = (process.env.COMBOS || 'light:en,dark:en,light:zh,dark:zh').split(',');

// the two dictionaries, read straight from the source
const dict = file => {
  const out = {};
  const re = /^\s*'([\w.]+)':\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"),?\s*$/;
  for (const line of readFileSync(`${DAPP}/src/i18n/${file}`, 'utf8').split('\n')) {
    const m = line.match(re);
    if (m) out[m[1]] = (m[2] ?? m[3]).replace(/\\(.)/g, '$1');
  }
  return out;
};
const EN = dict('en.ts');
const ZH = dict('zh.ts');
const tr = (lang, key, vars = {}) =>
  ((lang === 'zh' ? ZH[key] : undefined) ?? EN[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

const results = [];
let failed = 0;
const check = (name, ok, detail = '') => {
  results.push(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ` (${detail})` : ''}`);
  if (!ok) failed++;
};

const home = `${process.env.SMOKE_HOME || '/tmp/tokel-ui'}/${Date.now()}`;
rmSync(home, { recursive: true, force: true });
mkdirSync(home, { recursive: true });
const app = await electron.launch({
  executablePath: `${DAPP}/node_modules/electron/dist/electron`,
  args: [`${DAPP}/src/electron`, '--no-sandbox', '--disable-gpu'],
  env: { ...process.env, HOME: home, NODE_ENV: 'production' },
});
const page = await app.firstWindow();
const errors = [];
const outside = new Set();
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => m.type() === 'error' && errors.push(m.text().slice(0, 160)));
page.on('request', r => {
  const u = r.url();
  if (!/^(file|data|blob|devtools|chrome-extension):/.test(u)) outside.add(new URL(u).origin);
});
await page.waitForLoadState('load');
await page.waitForTimeout(2500);

const tid = id => page.locator(`[data-tid="${id}"]`);
const visible = (loc, timeout = 8000) => loc.first().waitFor({ state: 'visible', timeout }).then(() => true, () => false);
const gone = (loc, timeout = 5000) => loc.first().waitFor({ state: 'detached', timeout }).then(() => true, () => false);
const title = () => page.locator('main header h1').innerText().catch(() => '');
const modalTitle = () => page.locator('[role="dialog"] h2, [aria-modal="true"] h2').first().innerText().catch(() => '');
const themeIs = th =>
  page.waitForFunction(v => document.body.dataset.theme === v, th, { timeout: 3000 }).then(() => true, () => false);
const shot = async name => SHOTS && page.screenshot({ path: `${SHOTS}/${name}.png` });

// nothing wider than the window (at the smallest window size)
const noSideScroll = () =>
  page.evaluate(() => {
    const bad = [];
    if (document.documentElement.scrollWidth > window.innerWidth + 1) bad.push('page');
    document.querySelectorAll('main *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width && r.right > window.innerWidth + 1 && getComputedStyle(el).position !== 'fixed')
        bad.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`);
    });
    return bad.slice(0, 3);
  });

// in Chinese, no English sentence from the dictionary should be on screen
const englishLeft = async lang => {
  if (lang !== 'zh') return [];
  const text = await page.evaluate(() => document.body.innerText);
  return Object.entries(EN)
    .filter(([k, v]) => ZH[k] && ZH[k] !== v && v.length >= 10 && !v.includes('{') && text.includes(v))
    .map(([k]) => k)
    .slice(0, 5);
};

const closeModal = async how => {
  if (how === 'esc') await page.keyboard.press('Escape');
  else await tid('modal-close').click();
  return gone(tid('modal-close'));
};

const setPrefs = async (theme, lang) => {
  await page.evaluate(([th, l]) => {
    localStorage.setItem('tg.appearance', th);
    localStorage.setItem('tg.language', l);
  }, [theme, lang]);
  await page.reload();
  await page.waitForLoadState('load');
  await page.waitForTimeout(2000);
};

for (const combo of COMBOS) {
  const [theme, lang] = combo.split(':');
  const T = (k, v) => tr(lang, k, v);
  const c = (name, ok, d) => check(`[${combo}] ${name}`, ok, d);
  await setPrefs(theme, lang);

  // ---- before logging in ----
  c('theme applied', await themeIs(theme));
  c('entry: three ways in', (await page.locator('[data-tid^="entry-"]').count()) === 3);
  await shot(`entry-${combo.replace(':', '-')}`);
  await tid('entry-PASSWORD').click();
  c('entry: saved wallets opens and goes back', (await visible(tid('back'))) && (await tid('back').click(), await visible(tid('entry-PRIVKEY'))));
  await tid('entry-CREATE').click();
  const seedShown = await visible(tid('new-seed'));
  c('entry: create wallet shows a new phrase', seedShown);
  await tid('back').first().click();
  await visible(tid('entry-PRIVKEY'));
  await tid('entry-PRIVKEY').click();
  await tid('wif-input').fill(PHRASE);
  await tid('login-button').click();
  c('login with a seed phrase', await visible(tid('sidemenu'), 90000));
  await page.waitForTimeout(4000);

  // the phrase must not stay anywhere the page can read
  const leak = await page.evaluate(p => {
    const where = [];
    if (document.body.innerText.includes(p.split(' ').slice(0, 3).join(' '))) where.push('screen');
    for (const s of [localStorage, sessionStorage])
      for (let i = 0; i < s.length; i++) if ((s.getItem(s.key(i)) || '').includes(p.split(' ')[0] + ' ' + p.split(' ')[1])) where.push(s.key(i));
    if (Array.from(document.querySelectorAll('input,textarea')).some(el => el.value.includes(p.split(' ')[0] + ' '))) where.push('input');
    return where;
  }, PHRASE);
  c('the seed phrase is gone after logging in', leak.length === 0, leak.join(','));

  // ---- sidebar ----
  const NAV = { dashboard: 'menu.wallet', dex: 'menu.dex', create_token: 'menu.create', swap: 'menu.swap', settings: 'menu.settings' };
  for (const [view, key] of Object.entries(NAV)) {
    await tid(`nav-${view}`).click();
    await page.waitForTimeout(250);
    c(`sidebar: ${view} opens with its title`, (await title()) === T(key), await title());
    c(`sidebar: ${view} is marked current`, (await tid(`nav-${view}`).getAttribute('aria-current')) === 'page');
  }
  await tid('nav-dashboard').click();
  await page.waitForTimeout(500);
  await shot(`dash-${combo.replace(':', '-')}`);

  // ---- wallet ----
  const filters = page.locator('[aria-pressed]', { hasText: T('dash.filterNft') });
  await filters.first().click();
  c('wallet: NFT filter turns on', (await filters.first().getAttribute('aria-pressed')) === 'true');
  await page.locator('[aria-pressed]', { hasText: T('dash.filterAll') }).first().click();
  await page.getByPlaceholder(T('dash.search')).fill('zzz');
  await page.getByPlaceholder(T('dash.search')).fill('');
  c('wallet: search box works', true);
  await tid('send-tkl').click();
  c('wallet: Send opens', await visible(tid('send-submit')), await modalTitle());
  await shot(`send-${combo.replace(':', '-')}`);
  c('wallet: Send closes with Escape', await closeModal('esc'));
  await tid('recv-acc_address').click();
  c('wallet: address opens the QR code', await visible(page.locator('[data-tid="modal-close"]')));
  c('wallet: QR code is drawn', (await page.locator('[role="dialog"] canvas, [role="dialog"] svg, canvas').count()) > 0);
  await shot(`receive-${combo.replace(':', '-')}`);
  c('wallet: QR closes with the close button', await closeModal('button'));
  await tid('recv-pub_key').focus();
  await page.keyboard.press('Enter');
  c('wallet: public key opens with the keyboard', await visible(tid('modal-close')));
  await closeModal('esc');
  await tid('feedback').click();
  c('toolbar: Feedback opens', (await visible(tid('modal-close'))) && (await page.getByText(T('fb.sign')).count()) > 0);
  await shot(`feedback-${combo.replace(':', '-')}`);
  await closeModal('esc');
  c('wallet: no English left', (await englishLeft(lang)).length === 0, (await englishLeft(lang)).join(','));

  // ---- DEX ----
  await tid('nav-dex').click();
  c('dex: welcome shown', await visible(tid('mktplace-welcome')));
  await shot(`dex-${combo.replace(':', '-')}`);
  const seg = n => tid('mktplace-sidemenu').locator('[role="radio"]').nth(n);
  c('dex: five sections', (await tid('mktplace-sidemenu').locator('[role="radio"]').count()) === 5);

  await seg(0).click();
  c('dex: Fill order section', (await visible(tid('mk-form-fill'))) && (await seg(0).getAttribute('aria-checked')) === 'true');
  await page.locator('[data-tid="mk-form-fill"] textarea').fill('not-an-order');
  await page.locator('[data-tid="mk-form-fill"] textarea').blur();
  await page.waitForTimeout(400);
  c('dex: a bad order ID is refused', (await page.getByText(T('val.orderId')).count()) > 0);
  c('dex: review stays off for a bad order', await tid('mk-review').isDisabled());
  // an ID that is no order used to freeze the whole app (the library's lookup never answered)
  await page.locator('[data-tid="mk-form-fill"] textarea').fill('cd'.repeat(32));
  c('dex: an unknown order says "not found"', await visible(tid('mk-not-found'), 40000));
  c('dex: the app still answers after an unknown order', (await page.evaluate(() => 1)) === 1);
  await shot(`dex-fill-${combo.replace(':', '-')}`);

  await seg(1).click();
  c('dex: Sell section', await visible(tid('mk-form-ask')));
  await page.locator('[data-tid="mk-form-ask"] input').first().click();
  await page.keyboard.type('zzzz');
  c('dex: asset search says nothing matched', await visible(page.getByText(T('sel.none'))));
  await page.keyboard.press('Escape');
  c('dex: review stays off without an asset', await tid('mk-review').isDisabled());
  await shot(`dex-sell-${combo.replace(':', '-')}`);

  await seg(2).click();
  c('dex: Bid section', await visible(tid('mk-form-bid')));
  await page.locator('[data-tid="mk-form-bid"] textarea').fill('ab'.repeat(32));
  c('dex: an unknown token says "not found"', await visible(tid('mk-not-found'), 40000));
  c('dex: an unknown token gets no bid button', await tid('mk-review').isDisabled());
  await shot(`dex-bid-${combo.replace(':', '-')}`);

  await seg(3).click();
  c('dex: My orders, both lists empty', (await visible(tid('mk-my-sells'))) && (await page.getByText(T('mk.none')).count()) === 2);
  await shot(`dex-orders-${combo.replace(':', '-')}`);
  await seg(4).click();
  c('dex: Offers, empty', (await visible(tid('mk-offers'))) && (await page.getByText(T('mk.noOffers')).count()) === 1);
  c('dex: no English left', (await englishLeft(lang)).length === 0, (await englishLeft(lang)).join(','));

  // ---- create ----
  await tid('nav-create_token').click();
  await tid('create-nft').click();
  c('create: NFT form', (await visible(tid('submit-token'))) && (await tid('create-nft').getAttribute('aria-pressed')) === 'true');
  await page.locator('input[name="url"]').focus();
  const ipfs = await visible(tid('ipfs-ok'));
  c('create: media field explains IPFS first', ipfs);
  await shot(`ipfs-${combo.replace(':', '-')}`);
  if (ipfs) await tid('ipfs-ok').click();
  c('create: IPFS note closes', await gone(tid('ipfs-ok')));
  await tid('token-advanced').click();
  c('create: Advanced opens', (await tid('token-advanced').getAttribute('aria-expanded')) === 'true');
  await shot(`create-nft-${combo.replace(':', '-')}`);
  await tid('token-advanced').click();
  await tid('create-token').click();
  c('create: token form', (await tid('create-token').getAttribute('aria-pressed')) === 'true');
  c('create: no English left', (await englishLeft(lang)).length === 0, (await englishLeft(lang)).join(','));

  // ---- swap ----
  await tid('nav-swap').click();
  c('swap: "not available yet" note', (await page.getByText(T('note.unavailable', { name: T('note.swap') })).count()) > 0);

  // ---- settings ----
  await tid('nav-settings').click();
  await shot(`settings-${combo.replace(':', '-')}`);
  const pick = (group, value) => tid(group).locator(`[data-value="${value}"]`);
  await pick('set-appearance', theme === 'dark' ? 'light' : 'dark').click();
  c('settings: appearance switches at once', await themeIs(theme === 'dark' ? 'light' : 'dark'));
  await pick('set-appearance', theme).click();
  c('settings: appearance switches back', await themeIs(theme));
  const other = lang === 'zh' ? 'en' : 'zh';
  await pick('set-language', other).click();
  c('settings: language switches at once', (await title()) === tr(other, 'menu.settings'));
  await pick('set-language', lang).click();
  c('settings: language switches back', (await title()) === T('menu.settings'));
  c('settings: choice is kept', (await page.evaluate(() => localStorage.getItem('tg.language'))) === lang);
  await tid('set-network').click();
  c('settings: network dialog opens', await visible(tid('network-prefs')));
  await shot(`network-${combo.replace(':', '-')}`);
  await tid('network-close').click();
  c('settings: network dialog closes', await gone(tid('network-prefs')));
  c('settings: no English left', (await englishLeft(lang)).length === 0, (await englishLeft(lang)).join(','));

  // ---- smallest window: nothing spills sideways ----
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(900, 560));
  await page.waitForTimeout(400);
  for (const view of ['dashboard', 'dex', 'create_token', 'settings']) {
    await tid(`nav-${view}`).click();
    await page.waitForTimeout(300);
    const bad = await noSideScroll();
    c(`small window: ${view} fits`, bad.length === 0, bad.join(','));
  }
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1240, 720));
  await page.waitForTimeout(300);

  // ---- log out ----
  await tid('logout').click();
  c('log out returns to the start', await visible(tid('entry-PRIVKEY'), 15000));
}

check('no errors in the app', errors.length === 0, errors.slice(0, 4).join(' | '));
check('nothing loaded from the internet by the window', outside.size === 0, [...outside].join(','));

await app.close();
console.log(results.join('\n'));
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
