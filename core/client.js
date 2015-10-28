var protocol;
var channel;
var room;
var account;
var messageLog;
var snoopLog;
var snoopers = [];
var snooping = false;
var myName;
var address;
var version;
var port;
var authenticated;
var gagged;
var gagTime;
var lastActivity;
var socket;

var Client = function(name, ip) {
  this.name = name;
  this.ip = ip;

  //socket.on('data', messageReceived);

  return this;
};

Client.prototype.kill = function() {
  //this.socket.destroy();
};

function messageReceived(data) {

}

module.exports = Client;
