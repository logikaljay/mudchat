"use strict";

var Room = require('./room');
var Client = require('./client');
var Handshake = require('./handshake');
var Commands = require('./commands');
var net = require('net');

var instance;

/**
 * Server contructor
 * @constructor
 * @param  {string} name  the name of the chatserver (defaults to 'chatserver')
 * @param  {int} port     the port to listen on (defaults to 4050)
 * @return {Server}       the server object
 */
class Server {
  constructor(name, port) {
    instance = this;
    this.name = name || 'chatserver';
    this.port = port || 4050;

    this.clients = [];
    this.rooms = [];

    // load commands
    Commands.load();

    // create the main room
    this.rooms.main = new Room("main", null, 0);

    // create the socket
    this._server = this.createServer(port, this);

    // emit that the chat server has started
    process.emit('chat.server.started', this);

    // listen for commands coming from users
    process.on('chat.client.message.command', this.processCommand);

    return this;
  }

  /**
   * Get the server instance
   * @return {Server} the server instance
   */
  static getInstance() {
    return instance;
  }

  /**
   * Create the socket
   * @private
   * @param  {int} port the port to listen on
   * @todo Validate the user has an account before putting them in the room
   */
  createServer(port) {
    // setup the socket
    this.clients = [];
    return net.createServer(socket => {

      // emit a event about the connection
      process.emit('chat.client.connection', socket);

      // lets handshake with the client
      var protocol = new Handshake(socket, handshake => {
        // emit an event about the handshake
        process.emit('chat.client.handshake', handshake);

        if (typeof handshake !== 'undefined') {
          var client = new Client(handshake.name, handshake.ip);
          client.port = handshake.port;
          client.protocol = handshake.protocol;
          client.setSocket(socket);

          // TODO: Check if user is authenticated
          if (true) {
            // check if client.name is already in this.clients
            if (Object.keys(this.clients).indexOf(client.name) > -1) {
              console.log("%s is already a client of mine - killing them.", client.name);
              this.clients[client.name].kill("Your connection has been closed because someone else logged on with your username.");
            }

            // add the client to the list
            this.clients[client.name] = client;

            // put the new client in the main room - TODO: check validation
            this.rooms.main.join(client, true);
          }
        }
      });

    }).listen(port, () => {
      process.emit('chat.server.listen', instance);
    });
  }

  /**
   * Process and execute a command sent by a user
   * @private
   * @param  {Object} payload [the command data and client who sent it]
   */
  processCommand(payload) {
    if (payload.client === undefined || payload.data === undefined) {
      return;
    }

    var commandData = payload.data.match(/(.*) chats to you, '(.*)'/i);
    var clientName = commandData[1];
    var command = commandData[2].split(" ");

    Commands.exec(payload.client, command);
  }
}

module.exports = Server;
