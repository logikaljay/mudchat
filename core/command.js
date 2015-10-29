"use strict";

var Commands = require('./commands');

class Command {
  constructor(name, description, minLevel, exec) {
    this.name = name;
    this.description = description;
    this.minLevel = minLevel;
    this.exec = exec;

    Commands.add(this);
  }
}

module.exports = Command;
