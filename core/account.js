"use strict";

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
        this.lastLogin = obj.lastLogin;
        this.compact = obj.compact;
        this.gagList = obj.gagList;
        this.knownAddresses = obj.knownAddresses;
        this.created = obj.created;
      }
    } else {

      // make sure the user does not already exist
      if (!Account.exists(name)) {
        this.name = name;
        this.salt = Account.generateSalt();
        this.password = Account.hashPassword(this.salt, password);
        this.level = level;
        this.created = new Date();

        this.save();
      }
    }
  }

  static exists(name) {
     return fs.existsSync(path.join(Account.getPath(name)));
  }

  static numAccounts() {
    return fs.readdirSync(path.join(Account.getPath(), '..')).length;
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

  static challenge(socket, callback) {
    var message = "You have 30 seconds to message me your password.";
    var hexMessage = "";
    for (var i = 0; i < message.length; i++) {
      hexMessage += message.charCodeAt(i).toString(16);
    }

    var buf = new Buffer('05' + hexMessage + 'FF', 'hex');
    socket.write(buf);
    var t = setTimeout(() => {
      socket.destroy();
    }, 5 * 1000);

    callback(t);
  }

  save() {
    fs.writeFileSync(Account.getPath(this.name), JSON.stringify(this), 'utf8');
  }

  validate(password) {
    return Account.hashPassword(this.salt, password) === this.password;
  }

  hasIPAddress(ip) {
    if (this.knownAddresses === undefined) {
      this.knownAddresses = [];
      return false;
    } else {
      return this.knownAddresses.indexOf(ip) > -1;
    }
  }

  userLoggedOn(date, ip) {
    if (!this.hasIPAddress(ip)) {
      this.knownAddresses.push(ip);
    }

    this.lastLogin = new Date();

    this.save();
  }
}

module.exports = Account;
