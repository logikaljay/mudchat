"use strict";

class MessageEvent {
  constructor(command, client, data) {
    this.command = command;
    this.client = client;
    this.data = data;

    this.date = new Date();
  }
}

module.exports = MessageEvent;
