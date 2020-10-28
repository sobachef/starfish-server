var bitcore = require('bitcore-lib');
delete global._bitcore;
var Message = require('./bitcore-message');
const sign = (message, key) => {
  const privateKey = bitcore.PrivateKey.fromWIF(key.priv)
  const msg = Message(message)
  return {
    address: key.address,
    message: message,
    sig: msg.sign(privateKey)
  }
}
const create = (seed, account, o) => {
  /********************************************************************
  * The derivation path follows the 
  * BIP44 standard with a twist:
  *
  * - A new account is create per web host
  * - It uses a new branch of "2" instead of (0 or 1)
  *
  * This way there is no overlap with existing BIP44 walletse but
  * the wallet scheme can seamlessly integrate with them.
  *
  ********************************************************************/
  const StarfishBranch = 2
  const path = `m/44'/0'/${account}'/${StarfishBranch}/0`
  const derived = seed.key.deriveChild(path)
  const keys = {
    path: path,
    pub: derived.publicKey.toString(),
    address: derived.privateKey.toAddress().toString(),
    host: o.host,
  }
  return keys
}
const seed = (hex) => {
  let buf = (hex ? Buffer.from(hex, "hex") : bitcore.crypto.Random.getRandomBuffer(64))
  try {
    let key = bitcore.HDPrivateKey.fromSeed(buf)
    return {
      hex: buf.toString("hex"),
      key: key
    }
  } catch (e) {
    console.log("error", e)
    throw e
  }
}
const derive = (seed, path) => {
  return seed.key.deriveChild(path)
}
const verify = (message, address, sig) => {
  return Message(message).verify(address, sig)
}
const build = (o) => {
}
module.exports = {
  seed: seed,
  derive: derive,
  sign: sign,
  verify: verify,
  create: create
}
