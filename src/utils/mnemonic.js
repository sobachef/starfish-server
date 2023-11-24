import { MnemonicEN } from "@bsvwasm/mnemonic";
import { Hash } from "bsv-wasm";
import randomBytes from "randombytes";
import { bip39words } from "./bip39words.js";

function generateEntropy(bitLength) {
  if (bitLength % 32 !== 0 || bitLength < 128 || bitLength > 256) {
    throw new Error(
      "Invalid bit length. Valid options are: 128, 160, 192, 224, 256"
    );
  }

  return randomBytes(bitLength / 8);
}

function entropyToMnemonic(entropy) {
  const entropyBits = bufferToBinaryString(entropy);
  const checksum = Hash.sha_256(entropy).to_bytes();
  // TODO: Test this change to not use crypto package
  // const checksum = createHash("sha256").update(entropy).digest();
  const checksumBits = bufferToBinaryString(Buffer.from(checksum)).substring(
    0,
    (entropy.length * 8) / 32
  );

  const bits = entropyBits + checksumBits;
  const mnemonicWords = [];

  for (let i = 0; i < bits.length; i += 11) {
    const index = parseInt(bits.slice(i, i + 11), 2);
    mnemonicWords.push(bip39words[index]);
  }

  return new MnemonicEN(mnemonicWords.join(" "));
}

function generateMnemonic(bitLength) {
  const entropy = generateEntropy(bitLength);
  return entropyToMnemonic(entropy);
}

function bufferToBinaryString(buffer) {
  return buffer
    .toString("hex")
    .match(/.{2}/g)
    .map((byte) => parseInt(byte, 16).toString(2).padStart(8, "0"))
    .join("");
}

export { generateEntropy, generateMnemonic };
