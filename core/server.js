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
var Commands = require('./commands');
var net = require('net');

/**
 * Server contructor
 * @constructor
 * @param  {string} name  the name of the chatserver (defaults to 'chatserver')
 * @param  {int} port     the port to listen on (defaults to 4050)
 * @return {Server}       the server object
 */
var Server = function(name, port) {
  instance = this;
  this.name = name || 'chatserver';
  this.port = port || 4050;

  // init our arrays
  this.clients = [];
  this.rooms = [];

  // load our commands
  Commands.load();

  // create the main room
  this.rooms.main = new Room("main", null, 0);

  // create the net socket
  this._server = createServer(port, this);

  // emit the chat server started
  process.emit('chat.server.started', this);

  // listen for commands coming from users
  process.on('chat.client.message.command', processCommand);

  return this;
};

/**
 * Get the server instance
 * @return {Server} [the server instance]
 */
module.exports.getInstance = function() {
  return instance;
};

/**
 * Create the socket
 * @param  {int} port [the port to listen on]
 */
function createServer(port, server) {
  // lets handshake with the client
  server.clients = [];

  return net.createServer(function(socket) {

    // emit a event about the connection
    process.emit('chat.client.connection', socket);

    var protocol = new Handshake(socket, function(handshake) {
      // emit an event about the handshake
      process.emit('chat.client.handshake', handshake);

      if (typeof handshake !== 'undefined') {
        var client = new Client(handshake.name, handshake.ip);
        client.port = handshake.port;
        client.protocol = handshake.protocol;
        client.setSocket(socket);
        server.clients.push(client);
        client.room = server.rooms.main;

        // put the new client in the main room - TODO: check validation
        server.rooms.main.join(client, true);
      }
    });

  }).listen(port, function() {
    process.emit('chat.server.listen', instance);
  });
}

/**
 * Process and execute a command sent by a user
 * @param  {Object} payload [the command data and client who sent it]
 */
function processCommand(payload) {
  if (payload.client === undefined || payload.data === undefined) {
    return;
  }

  var commandData = payload.data.match(/(.*) chats to you, '(.*)'/i);
  var clientName = commandData[1];
  var command = commandData[2].split(" ");

  Commands.exec(payload.client, command);
}

module.exports = Server;
