/**
 * @jest-environment node
 */
import fs from 'fs';
import os from 'os';
import path from 'path';

import tar from 'tar-fs';

jest.setTimeout(10 * 60 * 1000);

// The factory runs before this file's other statements (jest hoists it), so
// it must create the temp home itself.
jest.mock('os', () => {
  const actual = jest.requireActual('os');
  const dir = jest
    .requireActual('fs')
    .mkdtempSync(jest.requireActual('path').join(actual.tmpdir(), 'tokel-wallet-test-'));
  return { ...actual, homedir: () => dir };
});

const mockHome = os.homedir();

// eslint-disable-next-line import/first
import { USER_WALLET_DIR, decrypt, encrypt } from '../core';

const unpack = (name: string) => {
  const dir = path.join(USER_WALLET_DIR, `${name}-unpacked`);
  return new Promise<string>(resolve =>
    fs
      .createReadStream(path.join(USER_WALLET_DIR, `${name}.wallet`))
      .pipe(tar.extract(dir))
      .on('finish', () => resolve(dir))
  );
};

const repack = (dir: string, name: string) =>
  new Promise<void>(resolve =>
    tar
      .pack(dir)
      .pipe(fs.createWriteStream(path.join(USER_WALLET_DIR, `${name}.wallet`)))
      .on('finish', () => {
        fs.rmSync(dir, { recursive: true });
        resolve();
      })
  );

afterAll(() => fs.rmSync(mockHome, { recursive: true, force: true }));

it('uses an isolated temp home', () => {
  expect(mockHome.startsWith(os.tmpdir())).toBe(true);
  // same folder on every OS (Windows accepts the '/' the app has always used: existing wallets stay where they are)
  expect(path.resolve(USER_WALLET_DIR)).toBe(path.join(mockHome, '.tokel-wallets'));
});

describe('wallet encryption', () => {
  it('round-trips and rejects a wrong password', async () => {
    await encrypt('roundtrip', 'Ukey-roundtrip', 'password1');
    expect((await decrypt('roundtrip', Buffer.from('password1'))).toString()).toBe(
      'Ukey-roundtrip'
    );
    await expect(decrypt('roundtrip', Buffer.from('password2'))).rejects.toThrow(
      'Incorrect password'
    );
  });

  it.each(['..', '.', '../escape', '../../..', '/etc/passwd', 'a/b', 'a\\b', 'nul\0byte', ''])(
    'refuses wallet name %j without touching the filesystem outside the wallet dir',
    async name => {
      const before = fs.readdirSync(mockHome);
      await expect(encrypt(name, 'x', 'password1')).rejects.toThrow('Invalid wallet name');
      await expect(decrypt(name, Buffer.from('password1'))).rejects.toThrow('Invalid wallet name');
      expect(fs.readdirSync(mockHome)).toEqual(before);
    }
  );

  it('detects a tampered ciphertext', async () => {
    await encrypt('tamper', 'Ukey-tamper', 'password1');
    const dir = await unpack('tamper');
    const data = fs.readFileSync(path.join(dir, 'data'));
    data[0] = 255 - data[0];
    fs.writeFileSync(path.join(dir, 'data'), data);
    await repack(dir, 'tamper');
    await expect(decrypt('tamper', Buffer.from('password1'))).rejects.toThrow();
  });

  it('still opens legacy wallets written without an auth tag', async () => {
    await encrypt('legacy', 'Ukey-legacy', 'password1');
    const dir = await unpack('legacy');
    const creds = JSON.parse(fs.readFileSync(path.join(dir, 'creds'), 'utf8'));
    delete creds.tag;
    fs.writeFileSync(path.join(dir, 'creds'), JSON.stringify(creds));
    await repack(dir, 'legacy');
    expect((await decrypt('legacy', Buffer.from('password1'))).toString()).toBe('Ukey-legacy');
  });

  it('ignores path-traversal entries inside a malicious wallet file', async () => {
    await encrypt('evil', 'Ukey-evil', 'password1');
    const dir = await unpack('evil');
    const outside = path.join(mockHome, 'pwned');
    const packed = path.join(USER_WALLET_DIR, 'evil.wallet');
    await repack(dir, 'evil');
    // Append a crafted entry that tries to escape the extraction directory.
    // eslint-disable-next-line global-require
    const tarStream = require('tar-stream');
    const evilPack = tarStream.pack();
    const extract = tarStream.extract();
    await new Promise<void>((resolve, reject) => {
      extract.on('entry', (header, stream, next) => {
        stream.pipe(evilPack.entry(header, next));
      });
      extract.on('finish', () => {
        evilPack.entry({ name: '../../pwned' }, 'owned');
        evilPack.finalize();
      });
      const chunks: Buffer[] = [];
      evilPack.on('data', (c: Buffer) => chunks.push(c));
      evilPack.on('end', () => {
        fs.writeFileSync(packed, Buffer.concat(chunks));
        resolve();
      });
      fs.createReadStream(packed).on('error', reject).pipe(extract);
    });
    expect((await decrypt('evil', Buffer.from('password1'))).toString()).toBe('Ukey-evil');
    expect(fs.existsSync(outside)).toBe(false);
  });

  it('survives randomised wallet names without escaping the wallet dir', async () => {
    const alphabet = 'ab./\\\0 .-_~%';
    const before = fs.readdirSync(mockHome).sort();
    const isValid = (name: string) => /^[^/\\\0]+$/.test(name) && name !== '.' && name !== '..';
    const names = Array.from({ length: 500 }, () =>
      Array.from(
        { length: 1 + Math.floor(Math.random() * 8) },
        () => alphabet[Math.floor(Math.random() * alphabet.length)]
      ).join('')
    );
    // Only exercise invalid names; valid ones would each cost a 10M-round PBKDF2.
    const invalid = names.filter(name => !isValid(name));
    expect(invalid.length).toBeGreaterThan(0);
    await Promise.all(
      invalid.map(name =>
        expect(encrypt(name, 'x', 'password1')).rejects.toThrow('Invalid wallet name')
      )
    );
    expect(fs.readdirSync(mockHome).sort()).toEqual(before);
  });
});
