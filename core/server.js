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

    this.clients = new Map();
    this.rooms = new Map();

    // load commands
    Commands.load();

    // create the main room
    this.rooms.set('main', new Room('main', null, 0));

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
            this.challengeAuthentication(socket, t => {
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

  stop() {
    if (this._server) {
      this._server.close();
    }
  }

  /**
   * Challenge the user for their passwordMatch
   * @param  {Socket}   socket   the socket of the user that is being challenged
   * @param  {Function} callback a function to call once the user has been challenged
   */
  challengeAuthentication(socket, callback) {
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

  /**
   * Process the connections authentication
   * @param  {Client} client the client that is being challenged
   * @param  {socket} socket the socket that the client has connected with
   * @param  {Buffer} data   The buffer of data that was sent by the Client
   * @param  {timer} timer  the timer which will kill the clients connection if they take too long
   */
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

  /**
   * User authenticated, log them on, add them to the room, set lastLogin times etc.
   * @param  {Client} client the client that has logged on
   * @param  {Socket} socket The client's socket used for writing/reading
   * @param  {Timer} timer  the timer that is going to kill the user - can be null if the user was logged on by their IP Address and not challenged for a password
   */
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
      this.clients.get(client.name).kill("Your connection has been closed because someone else logged on with your username.");
    }

    // add the client to the list
    this.clients.set(client.name, client);

    // put the new client in the main room
    var room = Room.get('main');
    room.join(client, true);
  }
}

module.exports = Server;
