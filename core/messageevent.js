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
        console.log(this.command + " " + this.data);

        // formulate the hexMessage
        var hexMessage = "";
        for (var i = 0; i < this.data.length; i++) {
          // intercept new lines
          if (this.data.charCodeAt(i) == '10') {
            hexMessage += '0a';
          } else if (this.data.charCodeAt(i) == '9') {
            hexMessage += '09';
          } else if (this.data.charCodeAt(i) == '13') {
            hexMessage += '0d';
          } else {
            hexMessage += ''+this.data.charCodeAt(i).toString(16);
          }
        }


        var buf = new Buffer(this.command + hexMessage + MessageEvent.Type.END, 'hex');
        this.client.socket.write(buf);
      }

    }
  }
}

const TYPE = {
  VERSION: "13",
  PUBLIC: "04",
  PRIVATE: "05",
  PINGREQUEST: "1a",
  NAMECHANGE: "01",
  PEEK: "1c",
  RAW: "74",
  UPLOAD: "14",
  UPLOADCANCEL: "19",
  SERVED: "07",
  END: "FF"
};

MessageEvent.Type = TYPE;

module.exports = MessageEvent;
