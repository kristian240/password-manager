const crypto = require('crypto');

const ALGORITHM = 'aes-192-cbc';
const IV_SIZE = 16;
const KEY_SIZE = 24;
const SALT_LENGTH = 16;

const JOIN_SEPARATOR = ':';

function stretchString(sToStretch, salt, outputLength) {
  return crypto.pbkdf2Sync(sToStretch, salt, 100000, outputLength, 'sha512');
}

function keyFromPassword(password, salt) {
  return stretchString(password, salt, KEY_SIZE);
}

function generateSalt(saltSize = SALT_LENGTH) {
  return crypto.randomBytes(saltSize).toString('hex');
}

function generateIv(ivSize = IV_SIZE) {
  return crypto.randomBytes(ivSize);
}

function encrypt(password, data) {
  const iv = generateIv();

  const salt = generateSalt();
  const key = keyFromPassword(password, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encryptedData = cipher.update(data, 'binary', 'hex');
  encryptedData += cipher.final('hex');

  return [encryptedData, salt, iv.toString('hex')].join(JOIN_SEPARATOR);
}

function decrypt(password, data) {
  const [encryptedData, salt, ivHex] = data.split(JOIN_SEPARATOR);

  const iv = Buffer.from(ivHex, 'hex');
  const key = keyFromPassword(password, salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  let decryptedData = decipher.update(encryptedData, 'hex', 'binary');
  decryptedData += decipher.final('binary');

  return decryptedData;
}

// TODO: Za one koji žele više -> 1.
function hash(key, sourceData) {
  const hashBuffer = stretchString(sourceData, key.hashingSalt, 6);

  return hashBuffer.readUIntLE(0, 6);
}

module.exports = {
  encrypt,
  decrypt,
  hash,
};
