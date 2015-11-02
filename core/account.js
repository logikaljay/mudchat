"use strict";

var util = require('util');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

/**
 * Account class used for all account creations, password related functionality
 */
class Account {
  /**
   * Construct a new Account object from either an existing account or create a new account
   * @param  {string} name      the name of the user's account
   * @param  {string} password  the password of the user's account - if undefined, load the account
   * @param  {int} level        the level of the users account
   * @return {Account}          the Account object
   */
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

  /**
   * Check if the account exists
   * @param  {string} name the name of the account to check
   * @return {Boolean}      true if the user account exists
   */
  static exists(name) {
     return fs.existsSync(path.join(Account.getPath(name)));
  }

  /**
   * Get the number of accounts
   * @return {int} number of accounts that exist
   */
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

  /**
   * Generate a random base64 encoded salt
   * @return {string} base64 random string
   */
  static generateSalt() {
    return crypto.randomBytes(16).toString('base64');
  }

  /**
   * Hash the a password using salt
   * @param  {string} salt     the salt to use to generate the Hash
   * @param  {string} password the plain text password to Hash
   * @return {string}          the hash of the salt + password
   */
  static hashPassword(salt, password) {
    return crypto.createHash('sha512').update(salt+password).digest('hex');
  }

  /**
   * Load an account
   * @param  {string} name the name of the account to load
   * @return {Object}      the JSON parsed object of their account
   */
  static load(name) {
    if (fs.existsSync(Account.getPath(name))) {
      var userStr = fs.readFileSync(Account.getPath(name));
      var obj = JSON.parse(userStr);

      return obj;
    }
  }

  /**
   * Delete an account file
   * @param  {String} name the name of the account to delete
   * @return {Boolean}      true if the account was deleted
   */
  static delete(name) {
    if (Account.exists(name)) {
      var path = Account.getPath(name);
      fs.unlinkSync(path);
      return true;
    }

    return false;
  }

  /**
   * Save the user account
   */
  save() {
    fs.writeFileSync(Account.getPath(this.name), JSON.stringify(this), 'utf8');
  }

  /**
   * Validate the plain text password against the stored hash
   * @param  {string} password the plain text password to test
   * @return {Boolean}          true if the plain account salt + plain text password equals the stored password hash
   */
  validate(password) {
    return Account.hashPassword(this.salt, password) === this.password;
  }

  /**
   * Check if the account knows about the IP address
   * @param  {string}  ip the ip address
   * @return {Boolean}    true if the client knows about the ip address
   */
  hasIPAddress(ip) {
    if (this.knownAddresses === undefined) {
      this.knownAddresses = [];
      return false;
    } else {
      return this.knownAddresses.indexOf(ip) > -1;
    }
  }

  /**
   * Update the Account setting the date and adding the ip address
   * @param  {Date} date the date that the user has connected
   * @param  {string} ip   the IP address of the connected user
   */
  userLoggedOn(date, ip) {
    if (!this.hasIPAddress(ip)) {
      this.knownAddresses.push(ip);
    }

    this.lastLogin = new Date();

    this.save();
  }
}

module.exports = Account;
