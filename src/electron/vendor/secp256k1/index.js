'use strict'
// Tokel Genesis: secp256k1 3.8.1 with only its pure-JavaScript (elliptic) implementation. The native addon of
// this old version can't compile against current Electron, and the library already fell back to this exact code
// whenever the addon was missing. Same API, same results.
module.exports = require('./elliptic')
