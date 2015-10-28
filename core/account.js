var name;
var password;
var level;
var lastLogin;
var compact;
var knownAddresses = [];
var gagList = [];

var util = require('util');

module.exports = function(name, password, level) {
  this.name = name;
  this.password = password;
  this.level = level;

  return this;
};

module.exports.add = function(name) {
  return name;
};

module.exports.load = function(callback) {

};
