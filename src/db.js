const fs = require('fs');
const homedir = require('os').homedir();
const crypto = require('crypto');

const { encrypt, decrypt } = require('./crypto.js');

const PASSWORD_MANAGER_STORE = `${homedir}/.password-manager-kd`;

class Passwords {
  constructor() {
    this._data = null;
  }

  static storeExists() {
    return fs.existsSync(PASSWORD_MANAGER_STORE);
  }

  reset() {
    this._data = {};
  }

  get data() {
    return this._data;
  }

  add(account, password) {
    this._data[account] = password;
  }

  get(account) {
    return this._data[account] || null;
  }

  save(password) {
    this._data.__meta__ = crypto.randomBytes(128).toString('hex');

    const encryptedData = encrypt(password, JSON.stringify(this._data));

    fs.writeFileSync(PASSWORD_MANAGER_STORE, encryptedData);
  }

  load(password) {
    const encryptedData = fs.readFileSync(PASSWORD_MANAGER_STORE, {
      encoding: 'utf-8',
    });

    const rawData = decrypt(password, encryptedData);

    this._data = JSON.parse(rawData);

    return this._data;
  }
}

module.exports = Passwords;
