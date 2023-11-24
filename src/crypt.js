import crypto from "crypto";

const algorithm = "aes-256-cbc";

export function encrypt(text, keystr, keyBuffer) {
  const iv = crypto.randomBytes(16);
  if (!keyBuffer)
    keyBuffer = crypto.createHash("sha256").update(keystr).digest();
  let cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
}

export function decrypt(text, keystr, keyBuffer) {
  const iv = Buffer.from(text.iv, "hex");
  if (!keyBuffer)
    keyBuffer = crypto.createHash("sha256").update(keystr).digest();
  let encryptedText = Buffer.from(text.encryptedData, "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
