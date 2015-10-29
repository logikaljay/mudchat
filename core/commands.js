"use strict";

var commands = [];

var fs = require('fs');
var path = require('path');

/**
 * Commands class used to by the chat server and its plugins to manage the list of commands
 */
class Commands {
  /**
   * Add a command into the chat servers list
   * @param {String} name        The name of the command used for invocation
   * @param {String} description The description of the command used for help messages
   * @param {Integer} level      The minimum level required to execute the command
   * @param {Function} exec      The function to be executed
   */
  static add(name, description, level, exec) {
    this.init();

    commands[name] = { name, description, level, exec };
  }

  /**
   * Return all commands
   * @return {Array} array of commands loaded
   */
  static all() {
    this.init();

    return commands;
  }

  /**
   * Execute a command
   * @param  {Client} client  the client that is executing the command
   * @param  {Array}  command the array of the command payload
   */
  static exec(client, command) {
    this.init();

    var name = command.shift();

    console.log("%s sent command: %s", client.name, name);
    //console.log(client);
    if (commands[name] !== undefined) {
      //arguments.shift();
      commands[name].exec(client, name, command);
    }
  }

  /**
   * Init the commands and load them if not initalised
   */
  static init() {
    // only if commands is undefined do we want to action the init
    if (typeof commands === undefined) {
      commands = [];

      this.load();
    }
  }

  /**
   * Load all the commands from ./commands directory
   */
  static load() {
    var cmdsDir = path.join(__dirname, '../commands');
    var files = fs.readdirSync(cmdsDir);

    process.emit('chat.commands.loading', files);

    for (var file in files) {
      try {
        require(path.join(cmdsDir, files[file]));
      } catch (e) {
        console.log("Error loading command '%s':\n %s", files[file], e);
      }
    }
  }
}

module.exports = Commands;
