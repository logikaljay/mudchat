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
var self;

/**
 * Construct a new client
 * @constructor
 * @param  {String} name the name of the client
 * @param  {String} ip   the ip address of the client
 * @return {Client}      the client
 */
var Client = function(name, ip) {
  this.name = name;
  this.ip = ip;

  return this;
};

/**
 * Set the clients socket
 * @param  {Socket} socket the socket the client is connected with
 */
Client.prototype.setSocket = function(socket) {
  this.socket = socket;

  // listen for all commands
  socket.on('data', messageReceived.bind(this));
};

/**
 * Kill the clients connection
 */
Client.prototype.kill = function() {
  //this.socket.destroy();
};

/**
 * Send a message to the client
 * @param  {String}   message the message to send
 * @param  {Boolean} private if true, send a private message to the client
 */
Client.prototype.send = function(message, private) {
  var hexMessage = "";
  for (var i = 0; i < message.length; i++) {
    hexMessage += ''+message.charCodeAt(i).toString(16);
  }

  // send the message
  var buf = new Buffer((private ? "05" : "04") + hexMessage + "FF", 'hex');
  this.socket.write(buf);
};

/**
 * Message received from the Client
 * @private
 * @param  {Buffer} data The data that was received
 */
var messageReceived = function(data) {
  var str = data.toString();
  var command = data[0].toString(16);
  var payload = {
    client: this,
    data: data.toString().substring(2, data.length - 2)
  };

  switch (command) {
    case "13":
      // some clients send through the version twice (I'm looking at you TinTin++)
      break;
    case "4":
      // message to all = 4: \nTinTin chats to everyone, 'hi'
      process.emit('chat.client.message.room', payload);
      break;
    case "5":
      // private message = 5: \nTinTin chats to you, 'hi'
      process.emit('chat.client.message.command', payload);
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
}

module.exports = Client;
