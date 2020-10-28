const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
function encrypt(text, keystr) {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash("sha256").update(keystr).digest()
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}
function decrypt(text, keystr) {
  const iv = Buffer.from(text.iv, 'hex');
  const key = crypto.createHash("sha256").update(keystr).digest()
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
module.exports = {
  encrypt: encrypt, decrypt: decrypt
}
