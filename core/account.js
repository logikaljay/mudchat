"use strict";

var name;
var password;
var level;
var lastLogin;
var compact;
var knownAddresses = [];
var gagList = [];

var util = require('util');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

class Account {
  constructor(name, password, level) {
    // check if we are loading an account, or creating an account
    if (password === undefined) {
      var obj = Account.load(name);
      if (obj !== undefined) {
        this.name = obj.name;
        this.salt = obj.salt;
        this.password = obj.password;
        this.level = obj.level;
      }
    } else {
      this.name = name;
      this.salt = Account.generateSalt();
      this.password = Account.hashPassword(this.salt, password);
      this.level = level;

      fs.writeFileSync(Account.getPath(this.name), JSON.stringify(this), 'utf8');
    }
  }

  static getPath(name) {
    var accountsPath = path.join(__dirname, '../accounts');
    if (!fs.existsSync(accountsPath)) {
      fs.mkdirSync(accountsPath);
    }

    return path.join(accountsPath, name + ".json");
  }

  static generateSalt() {
    return crypto.randomBytes(16).toString('base64');
  }

  static hashPassword(salt, password) {
    return crypto.createHash('sha512').update(salt+password).digest('hex');
  }

  static load(name) {
    if (fs.existsSync(Account.getPath(name))) {
      var userStr = fs.readFileSync(Account.getPath(name));
      var obj = JSON.parse(userStr);

      return obj;
    }
  }

  validate(password) {
    return Account.hashPassword(this.salt, password) === this.password;
  }
}

module.exports = Account;
