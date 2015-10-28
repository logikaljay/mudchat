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

  return this;
};

Client.prototype.setSocket = function(socket) {
  this.socket = socket;
  console.log('setting socket!');
  console.log(this.socket);
  socket.on('data', messageReceived);
};

Client.prototype.kill = function() {
  //this.socket.destroy();
};

function messageReceived(data) {
  var str = data.toString();

  var command = data[0].toString(16);
  var payload = data.toString().substring(1, data.length - 2);

  switch (command) {
    case "13":
      // some clients send through the version twice (I'm looking at you TinTin++)
      break;
    case "4":
      // message to all = 4: \nTinTin chats to everyone, 'hi'
      break;
    case "5":
      // private message = 5: \nTinTin chats to you, 'hi'
      break;
    case "1a":
      // ping request = 1a: 1446068720587471
      break;
    case "1":
      // client name change = 1: bob
      break;
    case "1c":
      // peek connections = 1c:
      break;
    case "74":
      // send raw data message = 74: t++
      break;
    case "14":
      // upload file request = 14: tt++,835392
      break;
    case "7":
      // serve'd by client = 7: \nbob is now chat serving you.\n
      break;
    case "19":
      // cancel file request
      break;
  }

  // figure out what the message is by the first byte
  console.log("MessageEvent: %s: %s", data[0].toString(16), data.toString().substring(1));
}

module.exports = Client;
