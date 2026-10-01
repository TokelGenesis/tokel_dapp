// Real-app smoke test of the login fixes (Electron + Playwright; testcafe can't drive Electron 44).
// Uses a throwaway HOME, so no real wallet in ~/.tokel-wallets is ever read, and only public/throwaway phrases.
//   yarn build && cp -R build/* src/electron/
//   npm i --no-save playwright-core
//   SMOKE_HOME=/tmp/tokel-smoke SHOTS=/tmp/tokel-smoke xvfb-run -a node tests-e2e/smoke.e2e.mjs
//   rm -rf src/electron/dist src/electron/main.js src/electron/841.main.js src/electron/preload.js
import { _electron as electron } from 'playwright-core';
import { rmSync, mkdirSync } from 'node:fs';
const DAPP = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const TEST_KEY = 'scrap execute squeeze balance bronze velvet uniform choice region whisper rough first local wall record unable bullet evoke satisfy shell ladder slice traffic';
import { createRequire } from 'node:module';
const bip39 = createRequire(DAPP + '/src/electron/worker.js')('bip39');
const FRESH = bip39.generateMnemonic(256); // a new, empty, throwaway 24-word phrase (valid checksum)
const TYPO_KEY = TEST_KEY.replace(/traffic$/, 'traffic ').trim().replace(/ slice /, ' slide '); // one wrong (but real) word
const results = []; let failed = 0;
const check = (n, ok, d = '') => { results.push(`${ok ? 'ok  ' : 'FAIL'} ${n}${d ? ` — ${d}` : ''}`); if (!ok) failed++; };
async function launch() {
  const home = `${process.env.SMOKE_HOME}/${Math.random().toString(36).slice(2)}`; rmSync(home, { recursive: true, force: true }); mkdirSync(home, { recursive: true });
  const app = await electron.launch({ executablePath: `${DAPP}/node_modules/electron/dist/electron`, args: [`${DAPP}/src/electron`, '--no-sandbox', '--disable-gpu'], env: { ...process.env, HOME: home, NODE_ENV: 'production' } });
  const page = await app.firstWindow(); const log = { errors: [], urls: [] };
  page.on('pageerror', e => log.errors.push(e.message)); page.on('request', r => log.urls.push(r.url()));
  page.on('console', m => { if (m.type() === 'error') log.errors.push(m.text().slice(0, 160)); });
  await page.waitForLoadState('load');
  const pk = page.getByText(/private key/i).first(); if (await pk.isVisible().catch(() => false)) await pk.click();
  await page.locator('[data-tid="wif-input"]').waitFor({ timeout: 30000 });
  return { app, page, log };
}
const side = page => page.locator('[data-tid="sidemenu"]').first().waitFor({ timeout: 90000 }).then(() => true, () => false);

// A: log in at once, before nSPV has connected
{ const { app, page, log } = await launch(); const t = Date.now();
  await page.fill('[data-tid="wif-input"]', FRESH); await page.click('[data-tid="login-button"]');
  const ok = await side(page);
  check('A: logging in right after start reaches the main screen (no endless "Trying to connect")', ok, `${((Date.now() - t) / 1000).toFixed(1)} s`);
  await page.waitForTimeout(8000);
  const body = await page.evaluate(() => document.body.innerText);
  check('A: balance shown', /SPENDABLE[\s\S]{0,20}TKL/.test(body), body.replace(/\s+/g, ' ').slice(0, 120));
  check('A: a valid 24-word seed phrase needs no confirmation', await page.locator('[data-tid="login-confirm"]').count() === 0);
  check('E: nothing is fetched from price.tokel.io', !log.urls.some(u => u.includes('price.tokel.io')), log.urls.filter(u => u.includes('tokel.io')).join(','));
  check('A: no errors', log.errors.length === 0, log.errors.slice(0, 4).join(' | '));
  await app.close(); }

// B + D: free text asks first, shows the address, and only logs in after "This is my wallet"
{ const { app, page, log } = await launch();
  await page.waitForTimeout(4000);
  await page.fill('[data-tid="wif-input"]', 'not a real key at all'); await page.click('[data-tid="login-button"]');
  const box = await page.locator('[data-tid="login-confirm"]').waitFor({ timeout: 20000 }).then(() => true, () => false);
  const addr = box ? await page.locator('[data-tid="login-confirm-address"]').textContent() : '';
  check('B: free text shows a warning with the address it would open', box && /^R[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr), addr);
  await page.waitForTimeout(2500);
  check('B: not logged in before confirming', await page.locator('[data-tid="sidemenu"]').count() === 0);
  await page.fill('[data-tid="wif-input"]', 'not a real key at all!'); await page.waitForTimeout(300);
  check('D: changing the text removes the warning', await page.locator('[data-tid="login-confirm"]').count() === 0 && await page.locator('[data-tid="login-button"]').count() === 1);
  await page.click('[data-tid="login-button"]'); await page.locator('[data-tid="login-confirm"]').waitFor({ timeout: 20000 });
  const addr2 = await page.locator('[data-tid="login-confirm-address"]').textContent();
  check('D: a different text shows a different address', addr2 !== addr && /^R/.test(addr2), `${addr} vs ${addr2}`);
  await page.click('[data-tid="login-confirm-button"]');
  const ok = await side(page);
  check('B: after confirming, the wallet opens', ok);
  const shown = await page.evaluate(() => document.body.innerText);
  check('B: it is the address that was shown', shown.includes(addr2), addr2);
  check('B: no errors', log.errors.length === 0, log.errors.slice(0, 4).join(' | '));
  await app.close(); }

// C2: the repo's 23-word test phrase is not a standard phrase either
{ const { app, page } = await launch(); await page.waitForTimeout(4000);
  await page.fill('[data-tid="wif-input"]', TEST_KEY); await page.click('[data-tid="login-button"]');
  check('C: a 23-word phrase asks first', await page.locator('[data-tid="login-confirm"]').waitFor({ timeout: 20000 }).then(() => true, () => false));
  await app.close(); }

// C: one wrong word in a 24-word phrase is caught (checksum)
{ const { app, page } = await launch();
  await page.waitForTimeout(4000);
  await page.fill('[data-tid="wif-input"]', TYPO_KEY); await page.click('[data-tid="login-button"]');
  const box = await page.locator('[data-tid="login-confirm"]').waitFor({ timeout: 20000 }).then(() => true, () => false);
  check('C: a seed phrase with one wrong word asks first instead of opening an empty wallet', box);
  await page.screenshot({ path: `${process.env.SHOTS}/dapp-confirm.png` });
  await app.close(); }

console.log(results.join('\n')); console.log(`${results.length - failed}/${results.length} passed`); process.exit(failed ? 1 : 0);
