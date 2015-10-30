"use strict";

var util = require('util');

var MessageEvent = require('./messageevent');

class Client {
  /**
   * Construct a new client
   * @constructor
   * @param  {String} name the name of the client
   * @param  {String} ip   the ip address of the client
   * @return {Client}      the client
   */
  constructor(name, ip) {
    this.name = name;
    this.ip = ip;
  }

  /**
   * Set the clients socket and sets up the 'data' event listener
   * @param  {Socket} socket the socket the client is connected with
   */
  setSocket(socket) {
    this.socket = socket;
    socket.on('data', data => this.messageReceived(data));
  }

  /**
   * Kill the client's connection
   */
  kill(msg) {
    var Server = require('./server');
    var clients = Server.getInstance().clients;

    if (msg) {
      this.send(msg, true);
    }

    // destroy the socket
    this.socket.destroy();

    // remove the client from the list
    if (clients[this.name] !== undefined) {
      delete clients[this.name];
    }
  }

  /**
   * Send a message to the client
   * @param  {MessageEvent/String}   MessageEvent  the MessageEvent to send
   * @param  {Boolean}        isPrivate     if true, send a private message to the client
   */
  send(message, isPrivate) {
    if (message instanceof MessageEvent) {
      this.sendRaw(message.command, message.data);
      this.lastEvent = message;
    } else {
      // message was a string - send the string
      this.sendRaw((isPrivate ? "05" : "04"), message);
    }
  }

  sendRaw(cmd, message) {
    var hexMessage = "";
    for (var i = 0; i < message.length; i++) {
      // intercept new lines
      if (message.charCodeAt(i) == '10') {
        hexMessage += '0a';
      } else {
        hexMessage += ''+message.charCodeAt(i).toString(16);
      }
    }

    var buf = new Buffer(cmd + hexMessage + "FF", 'hex');

    if (this.socket.writable) {
      this.socket.write(buf);
    }
  }

  /**
   * Message received from the Client
   * @param  {Buffer} data The data that was received
   */
  messageReceived(data) {
    var str = data.toString();
    var command = data[0].toString(16);

    // create a message event
    var message = new MessageEvent(command, this, data.toString().substring(1, data.length - 1));

    // set the last seen for the client
    this.lastEvent = message;

    // handle the message
    this.handleMessage(message);
  }

  /**
   * Handle the message that was received
   * @param  {MessageEvent} The MessageEvent that is to be handled
   */
  handleMessage(message) {
    switch (message.command) {
      case "13":
        // some clients send through the version twice (I'm looking at you TinTin++)
        break;
      case "4":
        // message to all = 4: \nTinTin chats to everyone, 'hi'
        process.emit('chat.client.message.room', message);
        break;
      case "5":
        // private message = 5: \nTinTin chats to you, 'hi'
        this.handleCommand(message);
        break;
      case "1a":
        // ping request = 1a: 1446068720587471
        this.handlePingResponse(message);
        break;
      case "1":
        // client name change = 1: bob
        this.handleNameChange(message);
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
      default:
        // unrecognised commands
        break;
    }
  }

  /**
   * Process and execute a command sent by a user
   * @private
   * @param  {Object} payload [the command data and client who sent it]
   */
  handleCommand(message) {
    if (message.client === undefined || message.data === undefined) {
      return;
    }

    var commandData = message.data.match(/(.*) chats to you, '(.*)'/i);
    var clientName = commandData[1];
    var command = commandData[2].split(" ");

    var Commands = require('./commands');
    Commands.exec(message.client, command);
  }

  handlePingResponse(message) {
    this.sendRaw('1B', message.data);
  }

  handleNameChange(message) {
    var Server = require('./server');
    var clients = Server.getInstance().clients;
    var newName = message.data.trim();

    // firstly - check if the name doesn't already exist
    if (Object.keys(clients).indexOf(newName) > -1) {
      this.kill(util.format("The name '%s' is already in use - Impersonation attempt foiled!", newName));
      return;
    } else {
      // change the clients name in lists
      delete clients[this.name];
      clients[newName] = this;

      // send a message to the clients Room
      this.room.send({ client: this, data: util.format('%s is now known as %s', this.name, newName) });

      // change the clients name
      this.name = newName;
    }
  }
}

module.exports = Client;
