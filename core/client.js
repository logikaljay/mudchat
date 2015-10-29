"use strict";

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
  kill() {
    this.socket.destroy();
  }

  /**
   * Send a message to the client
   * @param  {String}   message the message to send
   * @param  {Boolean} isPrivate if true, send a private message to the client
   */
  send(message, isPrivate) {
    var hexMessage = "";
    for (var i = 0; i < message.length; i++) {
      hexMessage += ''+message.charCodeAt(i).toString(16);
    }

    // send the message
    var buf = new Buffer((isPrivate ? "05" : "04") + hexMessage + "FF", 'hex');
    this.socket.write(buf);
  }

  /**
   * Message received from the Client
   * @param  {Buffer} data The data that was received
   */
  messageReceived(data) {
    var str = data.toString();
    var command = data[0].toString(16);
    var payload = {
      client: this,
      data: data.toString().substring(1, data.length - 2)
    };

    this.handleMessage(command,payload);
  }

  /**
   * Handle the message that was received
   * @param  {String} command The hex byte command received from the client's chat software
   * @param  {Object} payload The payload contains the client and also the message data stripped of any protocol information
   */
  handleMessage(command, payload) {
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
        this.pingResponse(payload);
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
      default:
        // unrecognised commands
        break;
    }
  }

  pingResponse(payload) {
    var hexMessage = "";
    for (var i = 0; i < "1".length; i++) {
      hexMessage += "1".charCodeAt(i).toString(16);
    }
    var response = new Buffer('1B' + hexMessage + 'FF', 'hex');
    this.socket.write(response);
  }
}

module.exports = Client;
