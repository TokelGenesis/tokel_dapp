import scrypto, { BinaryLike } from 'crypto';
import fs, { promises as fsp } from 'fs';
import { homedir } from 'os';
import path from 'path';

import tar from 'tar-fs';

import { ENCRYPTION_DEFAULTS } from 'vars/defines';

export const USER_WALLET_DIR = `${homedir()}/.tokel-wallets`;

export interface IEncKey {
  key: Buffer;
  salt: Buffer;
}

export interface Credentials {
  name: string;
  salt: Buffer;
  hash: Buffer;
  iv: Buffer;
  tag?: Buffer;
}

const WALLET_FILES = ['data', 'creds'];

// Wallet names arrive over IPC from the renderer; never let them escape USER_WALLET_DIR.
export const walletDirFor = (walletName: string) => {
  if (
    typeof walletName !== 'string' ||
    !/^[^/\\\0]{1,100}$/.test(walletName) ||
    walletName === '.' ||
    walletName === '..'
  ) {
    throw new Error('Invalid wallet name');
  }
  const dir = path.resolve(USER_WALLET_DIR, walletName);
  if (path.dirname(dir) !== path.resolve(USER_WALLET_DIR)) {
    throw new Error('Invalid wallet name');
  }
  return dir;
};

// deliberately "slow" (constant time) equality function using
// bitwise comparison to prevent timing attacks
const constantTimeEqual = (a: Buffer, b: Buffer) =>
  a.length === b.length && scrypto.timingSafeEqual(a, b);

export const deriveKey = (
  password: BinaryLike,
  providedSalt: null | Buffer | ArrayBuffer | SharedArrayBuffer
): Promise<IEncKey> =>
  new Promise<{ key: Buffer; salt: Buffer }>((resolve, reject) => {
    const salt = providedSalt
      ? Buffer.isBuffer(providedSalt)
        ? providedSalt
        : Buffer.from(providedSalt)
      : scrypto.randomBytes(ENCRYPTION_DEFAULTS.KEY_LENGTH);
    // derive the key
    scrypto.pbkdf2(
      password,
      salt,
      ENCRYPTION_DEFAULTS.DERIVATION_ITERATIONS,
      ENCRYPTION_DEFAULTS.KEY_LENGTH,
      ENCRYPTION_DEFAULTS.HASH_ALGO,
      (err, key) => {
        if (err) reject(err);
        // return the key and the salt
        resolve({ key, salt });
      }
    );
  });

// derive a sha256 hash of the password + salt to allow us to check if a password is valid
const deriveHash = (key: Buffer, salt: Buffer): string => {
  const hash = scrypto
    .createHash(ENCRYPTION_DEFAULTS.HASH_ALGO)
    .update(`${key.toString('hex')}${salt.toString('hex')}`)
    .digest('hex');
  return hash;
};

// check the password hash stored in the credentials file against the provided password
const checkPasswordHash = (derivedKey: Buffer, creds: Credentials): boolean => {
  const hash = deriveHash(derivedKey, creds.salt);
  const match = constantTimeEqual(Buffer.from(hash, 'hex'), creds.hash);
  if (!match) throw new Error('Incorrect password');
  return match;
};

// encrypt a string with a given encryption key, storing all relevant details in a named wallet (tar) file
export const encrypt = async (walletName: string, dataString: string, encKey: BinaryLike) => {
  const tempDir = walletDirFor(walletName);
  try {
    await fsp.mkdir(USER_WALLET_DIR, { recursive: true });
    const walletPath = `${tempDir}${ENCRYPTION_DEFAULTS.WALLET_EXT}`;
    const { key, salt } = await deriveKey(encKey, null);
    // define output files and create the temp directory
    await fsp.mkdir(tempDir, { recursive: true });
    const dataDestPath = `${tempDir}/data`;
    const credsDestPath = `${tempDir}/creds`;
    // create the crypto init vector and cipher
    const iv = scrypto.randomBytes(ENCRYPTION_DEFAULTS.IV_LENGTH);
    const cipher = scrypto.createCipheriv(ENCRYPTION_DEFAULTS.ALGORITHM, key, iv);
    // generate hash of the password and salt
    const hash = deriveHash(key, salt);
    // encrypt the string and write to the data file using cipher
    const encryptedData = Buffer.concat([cipher.update(Buffer.from(dataString)), cipher.final()]);
    const tag = cipher.getAuthTag();
    await fsp.writeFile(dataDestPath, encryptedData);
    await fsp.writeFile(
      credsDestPath,
      JSON.stringify({
        name: walletName,
        salt: salt.toString('hex'),
        hash,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
      }),
      ENCRYPTION_DEFAULTS.WALLET_FILE_ENCODING
    );
    // create and write the tar file to a wallet file
    await new Promise((resolve, reject) => {
      const tarStream = fs.createWriteStream(walletPath);
      const tarPack = tar.pack(tempDir);
      tarPack.on('error', reject).pipe(tarStream).on('error', reject).on('finish', resolve);
    });
    await fsp.rm(tempDir, { recursive: true, force: true });
    return {
      key,
      salt,
      iv,
    };
  } catch (err) {
    await fsp.rm(tempDir, { recursive: true, force: true });
    throw err;
  }
};

// decrypt a wallet file created by `encrypt` with the provided encryption key
export const decrypt = async (walletName: string, encKey: Buffer) => {
  const tempDir = walletDirFor(walletName);
  try {
    const walletFilePath = `${tempDir}${ENCRYPTION_DEFAULTS.WALLET_EXT}`;
    // untar the .wallet file to a temp directory
    await fsp.mkdir(tempDir, { recursive: true });
    // extract the wallet file (which is a tar)
    await new Promise((resolve, reject) => {
      const tarStream = fs.createReadStream(walletFilePath);
      const tarExtract = tar.extract(tempDir, {
        ignore: (name, header) =>
          header?.type !== 'file' || !WALLET_FILES.includes(path.basename(name)),
        map: header => ({ ...header, name: path.basename(header.name) }),
      });
      tarStream.on('error', reject).pipe(tarExtract).on('error', reject).on('finish', resolve);
    });
    // read the creds file
    const credsPath = `${tempDir}/creds`;
    const credsJson = JSON.parse(
      await fsp.readFile(credsPath, ENCRYPTION_DEFAULTS.WALLET_FILE_ENCODING)
    );
    const creds: Credentials = {
      name: credsJson.name,
      salt: Buffer.from(credsJson.salt, 'hex'),
      hash: Buffer.from(credsJson.hash, 'hex'),
      iv: Buffer.from(credsJson.iv, 'hex'),
      tag: credsJson.tag ? Buffer.from(credsJson.tag, 'hex') : undefined,
    };
    const { key } = await deriveKey(encKey, creds.salt);
    // check the stored pass+salt hash to know if we have the right password before
    // decrypting the payload, otherwise the decryption step has no idea if the resulting
    // data is valid or not
    checkPasswordHash(key, creds);
    // read the data file
    const dataPath = `${tempDir}/data`;
    const encryptedData = await fsp.readFile(dataPath);
    const decipher = scrypto.createDecipheriv(ENCRYPTION_DEFAULTS.ALGORITHM, key, creds.iv);
    let decryptedData = decipher.update(encryptedData);
    // Wallets written before the tag was stored can't be integrity-checked;
    // they get a tag the next time they are re-encrypted (e.g. password change).
    if (creds.tag) {
      decipher.setAuthTag(creds.tag);
      decryptedData = Buffer.concat([decryptedData, decipher.final()]);
    }
    await fsp.rm(tempDir, { recursive: true, force: true });
    return decryptedData;
  } catch (err) {
    await fsp.rm(tempDir, { recursive: true, force: true });
    throw err;
  }
};
