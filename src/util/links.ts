export default {
  explorers: {
    KMD: () => 'https://kmd.explorer.dexstats.info',
    TKL: path => `https://explorer.tokel.io/${path}`,
    TKLTEST: path => `http://explorer.komodoplatform.com:20000/${path}/TKLTEST`,
    TKLTEST2: path => `http://explorer.komodoplatform.com:20000/${path}/TKLTEST2`,
  },
  insightApi: {
    TKL: 'https://tokel.explorer.dexstats.info/insight-api-komodo',
    KMD: 'https://kmd.explorer.dexstats.info/insight-api-komodo',
    TKLTEST: 'https://explorer.komodoplatform.com:10000/tkltest/api/',
  },
  discord: 'https://discord.gg/MHxJZVFkqa',
  website: 'https://tokelgenesis.github.io',
  websiteRoadmap: 'https://tokelgenesis.github.io',
  githubIssue: 'https://github.com/TokelGenesis/tokel_dapp/issues/new',
  devEmail: 'mailto:imperialtokel@gmail.com',
  security: 'https://hackernoon.com/best-practices-for-key-security-for-your-crypto-wallets',
};
