import bitcore from "bitcore-lib";
import { encrypt as enc } from "../crypt.js";
import { generateMnemonic } from "../utils/mnemonic.js";
import Message from "./bitcore-message.js";

delete global._bitcore;

export const sign = (message, key, encoding) => {
  const privateKey = bitcore.PrivateKey.fromWIF(key.priv);
  const msg = Message(message, encoding);
  return {
    address: key.address,
    message: message,
    sig: msg.sign(privateKey),
    ts: Date.now(),
  };
};

export const encrypt = (message, key) => {
  const privateKey = bitcore.PrivateKey.fromWIF(key.priv).toBuffer();
  const data = enc(message, null, privateKey);
  return {
    address: key.address,
    data,
    ts: Date.now(),
  };
};

export const create = async (seed, account, o) => {
  /********************************************************************
   * The derivation path follows the
   * BIP44 standard with a twist:
   *
   * - A new account is created per web host
   * - It uses a new branch of "2" instead of (0 or 1)
   *
   * This way there is no overlap with existing BIP44 wallets but
   * the wallet scheme can seamlessly integrate with them.
   *
   ********************************************************************/
  const StarfishBranch = 2;
  const path = `m/44'/0'/${account}'/${StarfishBranch}/0`;
  const derived = seed.key.deriveChild(path);
  const address = derived.privateKey.toAddress().toString();
  const keys = {
    path,
    pub: derived.publicKey.toString(),
    address,
    host: o.host,
  };

  return keys;
};

export const seed = (hex, passphrase) => {
  let buf;
  if (!hex) {
    if (!passphrase) {
      throw new Error("passphrase required creting initial seed");
    }
    // if no providing a hex, derive a seed from passphrase
    let mnem = generateMnemonic(128)
    mnem.setPassphrase(passphrase)
    buf = Buffer.from(mnem.toBytes())
  } else {
    buf = Buffer.from(hex, "hex");
  }

  try {
    let key = bitcore.HDPrivateKey.fromSeed(buf);
    return {
      hex: buf.toString("hex"),
      key: key,
    };
  } catch (e) {
    throw e;
  }
};

export const derive = (seed, path) => {
  return seed.key.deriveChild(path);
};

export const verify = (message, address, sig, encoding) => {
  return Message(message, encoding).verify(address, sig);
};
