"use strict";

class MessageEvent {
  constructor(client, command, data) {
    this.command = command;
    this.client = client;
    this.data = data;

    this.date = new Date();
  }

  send() {
    if (this.client.socket.writable) {

      if (this.command.length > 0 && this.data.length > 0) {

        // formulate the hexMessage
        var hexMessage = "";
        for (var i = 0; i < this.data.length; i++) {
          hexMessage += this.data.charCodeAt(i).toString(16);
        }

        var buf = new Buffer(this.command + hexMessage + MessageEvent.Type.END, 'hex');
        this.client.socket.write(buf);
      }

    }
  }
}

const TYPE = {
  VERSION: "13",
  PUBLIC: "4",
  PRIVATE: "5",
  PINGREQUEST: "1a",
  NAMECHANGE: "1",
  PEEK: "1c",
  RAW: "74",
  UPLOAD: "14",
  UPLOADCANCEL: "19",
  SERVED: "7",
  END: "FF"
};

MessageEvent.Type = TYPE;

module.exports = MessageEvent;
