"use strict";
var TYPE = {
  VERSION: '13',
  PUBLIC: '04',
  PRIVATE: '05',
  PINGREQUEST: '1a',
  NAMECHANGE: '01',
  PEEK: '1c',
  RAW: '74',
  UPLOAD: '14',
  UPLOADCANCEL: '19',
  SERVED: '07',
  END: 'ff'
};

class MessageEvent {
  static message(cmd, message) {
    return new MessageEvent(null, cmd, message);
  }

  static version(version) {
    return MessageEvent.message(TYPE.VERSION, version);
  }

  static public(message) {
    return MessageEvent.message(TYPE.PUBLIC, message);
  }

  static private(message) {
    return MessageEvent.message('05', message);
  }

  static convertHex(message) {
    let hexMessage = "";
    for (var i = 0; i < message.length; i++) {
      let char = message.charCodeAt(i);

      // intercept new lines, tabs, and in some cases carriage returns
      if (char  == '10') {
        hexMessage += '0a';
      } else if (char == '9') {
        hexMessage += '09';
      } else if (char == '13') {
        hexMessage += '0d';
      } else {
        hexMessage += ''+char.toString(16);
      }
    }

    return hexMessage;
  }

  constructor(sender, command, data) {
    this.command = command;
    this.sender = sender;
    this.data = data;
    this.clients = new Map();
    this.date = new Date();
  }

  toClient(client) {
    this.clients = new Map();
    this.clients.set(client.name, client);

    return this;
  }

  toClients(clients) {
    this.clients = clients;

    return this;
  }

  toSocket(socket) {
    this.clients = new Map();
    this.clients.set('socket', {socket: socket});

    return this;
  }

  not(client) {
    this.clients.delete(client.name);

    return this;
  }

  send() {
    if (this.command === null) {
      throw new Error("No command supplied");
    }

    if (this.data === null) {
      throw new Error("No message supplied");
    }

    if (this.clients === undefined && this.sender === undefined) {
      throw new Error("No client(s) supplied");
    }

    var hexMessage = MessageEvent.convertHex(this.data);
    var buf = new Buffer(this.command + hexMessage + TYPE.END, 'hex');

    if (this.clients !== undefined) {
      console.log(this.clients.entries());
      this.clients.forEach(function(value, key) {
        if (!value.socket.writable) {
           return;
        }

        value.socket.write(buf);
      });
    } else {
      this.sender.socket.write(buf);
    }

    return this;
  }

  buffer() {
    var hexMessage = MessageEvent.convertHex(this.data);
    return new Buffer(this.command + hexMessage + TYPE.END, 'hex');
  }
}

MessageEvent.Type = TYPE;

module.exports = MessageEvent;
