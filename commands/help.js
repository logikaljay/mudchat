"use strict";

var Server = require('../core/server');
var Command = require('../core/command');
var Commands = require('../core/commands');

new Command('help', 'show the help', 0, (client, name, cmd) => {
  var commands = Commands.all();
  var response;

  if (cmd === undefined || cmd == []) {
    // iterate over commands and show the help message for all of them
    for (var command in commands) {
      response = name + ": " + commands[name].description;
      client.send(response, true);
    }
  } else {
    // get the specifc command and show the help message
    if (commands[name] !== undefined) {
      response = name + ": " + commands[name].description;
      client.send(response, true);
    }
  }
});
