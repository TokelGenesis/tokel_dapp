const { parentPort } = require('worker_threads');
const sb = require('satoshi-bitcoin');
const bip39 = require('bip39');
const BN = require('bn.js');

// Same as parseBigNumObject in helpers.ts TODO: don't repeat myself
const parseBigNumObject = bnObj => {
  if (!bnObj) return new BN(0);

  const bn = new BN(0);
  Object.entries(bnObj).forEach(([propName, propValue]) => {
    bn[propName] = propValue;
  });
  return bn;
};

const {
  ECPair,
  ccutils,
  general,
  networks,
  nspvConnect,
  cctokensv2,
  ccassetsv2,
  ccbasic,
  ccimp,
} = require('@tokel/nspv-js');

/*
 * The library's tokenV2FetchOrder throws inside `new Promise(async ...)`. For an ID that is not an order (a
 * wrong paste, a token ID, a spent order) its promise never settles and the error escapes as an unhandled
 * rejection, which used to kill this worker and freeze the whole app behind an error box. So the lookup gets a
 * deadline, and an escaped error is turned into the answer of the lookups waiting at that moment.
 */
const ORDER_LOOKUP_MS = 30000;
const waitingLookups = new Set();
process.on('unhandledRejection', reason => {
  console.error('unhandled rejection in the wallet worker', reason);
  waitingLookups.forEach(fail => fail(reason));
});
const fetchOrderSafely = (connection, network, wif, orderId) => {
  let fail;
  let timer;
  const escaped = new Promise((resolve, reject) => {
    fail = e => reject(e instanceof Error ? e : new Error(String(e)));
    timer = setTimeout(() => fail(new Error('Order not found')), ORDER_LOOKUP_MS);
    waitingLookups.add(fail);
  });
  return Promise.race([
    ccassetsv2.tokenV2FetchOrder(connection, network, wif, orderId),
    escaped,
  ]).finally(() => {
    clearTimeout(timer);
    waitingLookups.delete(fail);
  });
};

// the ID a failed lookup asked for, so the app can say "not found" (IDs only, never anything else)
const LOOKUPS = { asset_v2_fetch_order_decoded: 'orderId', token_v2_info_tokel: 'tokenId' };
const lookupId = msg => {
  const key = LOOKUPS[msg.type];
  const id = key && msg.payload && msg.payload[key];
  return typeof id === 'string' && /^[0-9a-fA-F]{64}$/.test(id) ? id : undefined;
};

const BitgoAction = {
  SET_NETWORK: 'set_network',
  RECONNECT: 'reconnect',
  NEW_ADDRESS: 'new_address',
  LOGIN: 'login',
  LOGOUT: 'logout',
  LIST_UNSPENT: 'list_unspent',
  LIST_TRANSACTIONS: 'list_transactions',
  SPEND: 'spend',
  BROADCAST: 'broadcast',
  TOKEN_V2_ADDRESS: 'token_v2_address',
  TOKEN_V2_INFO_TOKEL: 'token_v2_info_tokel',
  TOKEN_V2_TRANSFER: 'token_v2_transfer',
  TOKEN_V2_CREATE_TOKEL: 'token_v2_create_tokel',
  TOKEN_V2_ORDERS: 'token_v2_orders',
  ASSET_V2_FETCH_ORDER_DECODED: 'asset_v2_fetch_order_decoded',
  ASSET_V2_FILL_ASK: 'asset_v2_fill_ask',
  ASSET_V2_FILL_BID: 'asset_v2_fill_bid',
  ASSET_V2_POST_ASK: 'asset_v2_post_ask',
  ASSET_V2_POST_BID: 'asset_v2_post_bid',
  ASSET_V2_CANCEL_ASK: 'asset_v2_cancel_ask',
  ASSET_V2_CANCEL_BID: 'asset_v2_cancel_bid',
  ASSET_V2_MY_ORDERS: 'asset_v2_my_orders',
};

const IS_DEV = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
const SATOSHIS = 100000000;
class BitgoSingleton {
  constructor(network) {
    this.network = network;
  }

  async cleanup() {
    this.connection?.close();
  }

  async [BitgoAction.RECONNECT]() {
    if (this.connecting) return this.connecting; // one attempt at a time; callers share it
    this.connecting = (async () => {
      try {
        ccbasic.cryptoconditions = await ccimp;
        this.connection = await nspvConnect({ network: this.network }, {});
        return true;
      } catch (e) {
        console.log(e);
        return false;
      } finally {
        this.connecting = null;
      }
    })();
    return this.connecting;
  }

  /**
   * Calls that need the network wait for the connection instead of failing: logging in right after the app
   * starts used to ask for the balance before nSPV was connected, get "Not connected", and stay on
   * "Trying to connect to nspv..." for good.
   */
  async ensureConnected() {
    if (this.connection && this.connection.length !== 0) return;
    await this[BitgoAction.RECONNECT]();
    if (!this.connection || this.connection.length === 0) {
      throw new Error('Not connected');
    }
  }

  /**
   * Identifying key can WIF or SEED generated on creating the address
   * @param {string} key
   *
   * Sample response
   *
   * {
   *    address: "RVK1UNQtkcwZ2yJLBQXqEPbjDHrHhHCUeh"
   *    pubkey: "0376094fff1d654f441f82bca9c95bfd03d381e05491aca814d"
   *    result: "success"
   *  }
   */
  async [BitgoAction.LOGIN]({ key, confirmed = false }) {
    try {
      // Any text opens a wallet (it is hashed into a key, as in Agama), so a typo in a seed phrase silently opens
      // another, empty wallet. Unless the key is a WIF or a valid BIP39 phrase (checksum included), the address is
      // shown first and the wallet opens only once the user confirms it is theirs.
      const wif = general.keyToWif(key, this.network);
      if (!confirmed && wif !== key && !bip39.validateMnemonic(key)) {
        return { result: 'confirm', address: ECPair.fromWIF(wif, this.network).getAddress() };
      }
      this.wif = wif;
      const keyPair = ECPair.fromWIF(this.wif, this.network);
      this.address = keyPair.getAddress();
      this.pubkeyBuffer = keyPair.getPublicKeyBuffer();
      this.pubkey = this.pubkeyBuffer.toString('hex');
      return {
        address: this.address,
        pubkey: this.pubkey,
        result: 'success',
      };
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  async [BitgoAction.LOGOUT]() {
    this.wif = null;
    this.address = null;
    this.pubkey = null;
  }

  /**
   * Returns a newly generated address
   *
    return {
      address: 'RJfjdEYQPzbKtENYqRsJF6qpkhVrwGwZxU',
      pubkey: '0376094fff1d654f441f82bca9c95bfd03d381e05491aca814d',
      seed: 'spring stand agree true spring stand agree true spring stand agree true',
      wif: 'Uq6Hy34eqi3W35q8qY8BGqTp8Lr2WWAjcFftJ2YfvBh5UseskYUM',
    };
  */
  async [BitgoAction.NEW_ADDRESS]() {
    const seed = general.getSeedPhrase(256);
    const wif = general.keyToWif(seed, this.network);
    const keyPair = ECPair.fromWIF(wif, this.network);
    return {
      address: keyPair.getAddress(),
      pubkey: keyPair.getPublicKeyBuffer().toString('hex'),
      seed,
      wif,
    };
  }

  /**
   *
   * @param {string} address
   *
   * Sample response
   * {
   *
   *  "result" : success,
   *  "utxos" : [
   *      {
   *          "height" : 2241305,
   *          "txid" : 4e7b86eb846e593ca4e2130fa92af08ad7fcf541850684d64758855daef7fb4a,
   *          "vout" : 0,
   *          "value" : 1,
   *          "rewards" : 0
   *      }
   *  ],
   *  "address" : RKagfH9Fjcm2ddaDRcc3FfmrAViBzApXfp,
   *  "isCC" : 0,
   *  "height" : 2296137,
   *  "numutxos" : 1,
   *  "balance" : 1,
   *  "rewards" : 0,
   *  "skipcount" : 0,
   *  "filter" : 0,
   *  "lastpeer" : 136.243.58.134:7770
   * }
   */
  async [BitgoAction.LIST_UNSPENT](data) {
    await this.ensureConnected();
    const response = await ccutils.getNormalUtxos(this.connection, data.address, 0, 0);
    const ccUtxos = await cctokensv2.getAllTokensV2ForPubkey(
      this.connection,
      this.network,
      this.pubkeyBuffer,
      0,
      0
    );
    const res = {};
    ccUtxos.forEach(utxo => {
      if (utxo?.tokendata?.tokenid) {
        const tokenId = utxo.tokendata.tokenid.reverse().toString('hex');
        const currentSatoshis = parseBigNumObject(res[tokenId]);
        res[tokenId] = currentSatoshis.add(parseBigNumObject(utxo.satoshis));
      } else if (!!utxo?.tokendata?.name && utxo?.tokendata?.funcid === 'c') {
        // In case token was created by the wallet, but has no transactions
        const txId = utxo.txid.reverse().toString('hex');
        const currentSatoshis = parseBigNumObject(res[txId]);
        res[txId] = currentSatoshis.add(parseBigNumObject(utxo.satoshis));
      }
    });
    return {
      height: response.nodeheight,
      skipcount: response.skipcount,
      filter: response.filter,
      balance: response.total / SATOSHIS,
      numutxos: response.utxos.length,
      utxos: response.utxos,
      address: this.address,
      tokens: res,
    };
  }

  // async listUnspentTokens(address) {
  //   if (!this.connection || this.connection.length === 0) {
  //     throw new Error('Not connected');
  //   }
  //   return ccutils.getCCUtxos(this.connection, address);
  // }

  // eslint-disable-next-line class-methods-use-this
  async [BitgoAction.TOKEN_V2_INFO_TOKEL]({ tokenId }) {
    try {
      const token = await cctokensv2.tokensInfoV2Tokel(
        this.connection,
        this.network,
        this.wif,
        tokenId
      );
      return token;
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  async [BitgoAction.TOKEN_V2_ORDERS]({ tokenId }) {
    try {
      const orders = await ccassetsv2.tokenV2Orders(
        this.connection,
        this.network,
        this.wif,
        tokenId
      );
      return orders;
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  async [BitgoAction.ASSET_V2_MY_ORDERS]() {
    try {
      const orders = await ccassetsv2.myTokenV2Orders(this.connection, this.network, this.wif);
      return orders;
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  async [BitgoAction.ASSET_V2_FETCH_ORDER_DECODED]({ orderId }) {
    try {
      const order = await fetchOrderSafely(this.connection, this.network, this.wif, orderId);
      return order;
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  async [BitgoAction.ASSET_V2_FILL_ASK]({ orderId, tokenId, amount, unitPrice }) {
    try {
      const tx = await ccassetsv2.tokenv2fillask(
        this.connection,
        this.network,
        this.wif,
        tokenId,
        orderId,
        amount,
        unitPrice
      );

      const txResult = await this.broadcast({ txHex: tx.toHex() });
      return {
        ...txResult,
      };
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  async [BitgoAction.ASSET_V2_FILL_BID]({ orderId, tokenId, amount, unitPrice }) {
    try {
      const tx = await ccassetsv2.tokenv2fillbid(
        this.connection,
        this.network,
        this.wif,
        tokenId,
        orderId,
        amount,
        unitPrice
      );

      const txResult = await this.broadcast({ txHex: tx.toHex() });
      return {
        ...txResult,
      };
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  async [BitgoAction.ASSET_V2_POST_ASK]({ tokenId, amount, unitPrice }) {
    try {
      const tx = await ccassetsv2.tokenv2ask(
        this.connection,
        this.network,
        this.wif,
        amount,
        tokenId,
        unitPrice
      );

      const txResult = await this.broadcast({ txHex: tx.toHex() });
      return {
        ...txResult,
      };
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  async [BitgoAction.ASSET_V2_POST_BID]({ tokenId, amount, unitPrice }) {
    try {
      const tx = await ccassetsv2.tokenv2bid(
        this.connection,
        this.network,
        this.wif,
        amount,
        tokenId,
        unitPrice
      );

      const txResult = await this.broadcast({ txHex: tx.toHex() });
      return {
        ...txResult,
      };
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  async [BitgoAction.ASSET_V2_CANCEL_ASK]({ tokenId, orderId }) {
    try {
      const tx = await ccassetsv2.tokenv2cancelask(
        this.connection,
        this.network,
        this.wif,
        tokenId,
        orderId
      );

      const txResult = await this.broadcast({ txHex: tx.toHex() });
      return {
        ...txResult,
      };
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  async [BitgoAction.ASSET_V2_CANCEL_BID]({ tokenId, orderId }) {
    try {
      const tx = await ccassetsv2.tokenv2cancelbid(
        this.connection,
        this.network,
        this.wif,
        tokenId,
        orderId
      );

      const txResult = await this.broadcast({ txHex: tx.toHex() });
      return {
        ...txResult,
      };
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  async [BitgoAction.LIST_TRANSACTIONS]({ address, skipCount = 0 }) {
    await this.ensureConnected();
    // todo there is a better more dynamic way to implement transaction limit than hardcoded number
    const txIds = await ccutils.getTxids(this.connection, address, 0, skipCount, 100);
    const ids = txIds.txids.map(tx => tx.txid.reverse().toString('hex'));
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length > 0) {
      return ccutils.getTransactionsManyDecoded(
        this.connection,
        this.network,
        this.pubkeyBuffer,
        uniqueIds
      );
    }
    return [];
  }

  // eslint-disable-next-line class-methods-use-this
  async [BitgoAction.BROADCAST]({ txHex }) {
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      this.connection.nspvBroadcast(
        '0000000000000000000000000000000000000000000000000000000000000000',
        txHex,
        { numPeers: 8 },
        (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        }
      );
    });
  }

  // eslint-disable-next-line consistent-return
  async [BitgoAction.SPEND]({ address, amount }) {
    const amountInSatoshi = sb.toSatoshi(amount);
    const satoshiBigNum = new BN(amountInSatoshi);
    const amountBigNum = new BN(amount);
    await this.ensureConnected();
    const txHex = await general.create_normaltx(
      this.wif,
      address,
      satoshiBigNum,
      this.network,
      this.connection
    );
    const txResult = await this.broadcast({ txHex });
    return {
      ...txResult,
      address,
      amount: amountBigNum,
    };
  }

  async [BitgoAction.TOKEN_V2_TRANSFER]({ destpubkey, tokenid, amount }) {
    await this.ensureConnected();
    const tx = await cctokensv2.tokensv2Transfer(
      this.connection,
      this.network,
      this.wif,
      tokenid,
      destpubkey,
      amount
    );
    const txResult = await this.broadcast({ txHex: tx.toHex() });
    return {
      ...txResult,
      destpubkey,
      tokenid,
      amount,
    };
  }

  async [BitgoAction.TOKEN_V2_CREATE_TOKEL]({ name, supply, description, tokenData }) {
    await this.ensureConnected();
    const tx = await cctokensv2.tokensv2CreateTokel(
      this.connection,
      this.network,
      this.wif,
      name,
      description,
      supply,
      tokenData
    );

    const txResult = await this.broadcast({ txHex: tx.toHex() });
    return {
      ...txResult,
    };
  }
}

// @tokel/nspv-js 0.1.9 ships offline peers (192.99.71.125, 135.125.204.169) and protocol
// 170010, which tokeld 0.3.4 refuses (minimum 170011). Override until a fixed package is
// published (fixed upstream in nspv-js revival 9bee5fd).
const TOKEL = {
  ...networks.TOKEL,
  protocolVersion: 170011,
  staticPeers: ['94.130.38.173:29404', '136.243.144.90:29404'],
};
let network = IS_DEV ? networks.TKLTEST2 : TOKEL;
let bitgo = new BitgoSingleton(network);

const checkData = msg => {
  if (msg.type === BitgoAction.LOGIN) {
    return {
      type: msg.type,
    };
  }
  return msg;
};

parentPort.on('message', msg => {
  if (IS_DEV) {
    console.group('BITGO (WORKER)');
    console.log(checkData(msg));
    console.groupEnd();
  }

  if (msg.type === BitgoAction.SET_NETWORK) {
    bitgo.cleanup();
    network = {
      ...(msg.payload.network === 'TOKEL' ? TOKEL : networks[msg.payload.network]),
      ...msg.payload.overrides,
    };
    bitgo = new BitgoSingleton(network);
    bitgo[BitgoAction.RECONNECT]()
      .then(() => {
        return parentPort.postMessage({ type: BitgoAction.SET_NETWORK, data: true });
      })
      .catch(e => {
        parentPort.postMessage({ type: BitgoAction.SET_NETWORK, data: null, error: e.message });
      });
    return true;
  }

  if (!Object.values(BitgoAction).includes(msg.type)) return null;
  return bitgo[msg.type](msg.payload)
    .then(data => {
      if (data) {
        return parentPort.postMessage({ type: msg.type, data });
      }
      return null;
    })
    .catch(e => {
      return parentPort.postMessage({
        type: msg.type,
        data: null,
        error: e.message,
        lookupId: lookupId(msg),
      });
    });
});
