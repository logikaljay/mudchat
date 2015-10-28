var VERSION = "0.0.1";
var name;
var port;
var clients = [];
var banList = [];
var commands = [];
var instance;
var _server;

var Room = require('./room');
var Client = require('./client');
var Handshake = require('./handshake');
var net = require('net');

/**
 * Constructor
 * @param  {string} name  [the name of the chatserver (defaults to 'chatserver')]
 * @param  {int} port     [the port to listen on (defaults to 4050)]
 * @return {Server}       [the server object]
 */
module.exports = function(name, port) {
  instance = this;
  this.name = name || 'chatserver';
  this.port = port || 4050;

  // init our arrays
  this.clients = [];
  this.rooms = [];

  // create the main room
  this.rooms.push(new Room("main", null, 0));

  // create the net socket
  this._server = createServer(port);

  process.emit('chat.server.started', this);

  return this;
};

module.exports.getInstance = function() {
  return instance;
};

/**
 * Create the socket
 * @param  {int} port [the port to listen on]
 */
function createServer(port) {
  // lets handshake with the client
  var self = this;
  self.clients = [];

  var server = net.createServer(function(socket) {

    // emit a event about the connection
    process.emit('chat.client.connection', socket);

    var protocol = new Handshake(socket, function(handshake) {
      // emit an event about the handshake
      process.emit('chat.client.handshake', handshake);

      if (typeof handshake !== 'undefined') {
        var client = new Client(handshake.name, handshake.ip);
        client.port = handshake.port;
        client.protocol = handshake.protocol;
        self.clients.push(client);
        client.setSocket(socket);
      }
    });

  }).listen(port, function() {
    process.emit('chat.server.listen', instance);
  });

  return server;
}
