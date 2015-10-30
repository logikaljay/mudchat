"use strict";

var Room = require('./room');
var Client = require('./client');
var Handshake = require('./handshake');
var Commands = require('./commands');
var Account = require('./account');
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
          client.version = handshake.version;
          client.connected = new Date();

          // kill if the user doesn't have an account
          if (!Account.exists(client.name)) {
            client.socket = socket;
            client.kill("You do not have an account on this chatserver");
            return;
          }

          // load and set their account
          client.account = new Account(client.name);

          // check if the account has the client's IP addr as a knownAddresses
          if (client.account.hasIPAddress(client.ip)) {
            this.userAuthenticated(client, socket);
          } else {
            // request that the client authenticate
            Account.challenge(socket, t => {
              socket.on('data', data => {
                this.processAuthentication(client, socket, data, t);
              });
            });
          }
        }
      });

    }).listen(port, () => {
      process.emit('chat.server.listen', instance);
    });
  }

  processAuthentication(client, socket, data, timer) {
    // make sure that the message we received was a private message
    if (data[0].toString(16) == "5") {

      // get the password
      var messageData = data.toString().substring(1, data.length - 2);
      var passwordMatch = messageData.match(/(.*) chats to you, '(.*)'/i);
      var password = passwordMatch[2];

      // validate the password
      if (client.account.validate(password)) {
        this.userAuthenticated(client, socket, timer);
      } else {
        // password incorrect - kill kill kill
        socket.destroy();
      }
    }
  }

  userAuthenticated(client, socket, timer) {
    // invalidate the timer if it was passed
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = null;
    }

    // set the client's socket to start handling their usual commands
    client.setSocket(socket);

    // add the client's IP to the account
    client.account.userLoggedOn(new Date(), client.ip);

    // check if client.name is already in this.clients
    if (Object.keys(this.clients).indexOf(client.name) > -1) {
      this.clients[client.name].kill("Your connection has been closed because someone else logged on with your username.");
    }

    // add the client to the list
    this.clients[client.name] = client;

    // put the new client in the main room
    this.rooms.main.join(client, true);
  }
}

module.exports = Server;
