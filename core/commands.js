var commands = [];

var fs = require('fs');
var path = require('path');

/**
 * Commands object
 * @constructor
 */
var Commands = {};

/**
 * Load all the commands from ./commands directory
 */
Commands.load = function() {
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
};

/**
 * Init the commands and load them if not initalised
 */
Commands.init = function() {
  // only if commands is undefined do we want to action the init
  if (typeof commands === undefined) {
    commands = [];

    this.load();
  }
};

/**
 * Add a command to the list
 * @param  {String} name        the name of the command being added
 * @param  {String} description the description of the command being added
 * @param  {Integer} level      min level for execution of the command
 * @param  {Function} command   the function that gets executed
 */
Commands.add = function(name, description, level, command) {
  this.init();

  commands[name] = { name: name, description: description, level: level, exec: command };
};

/**
 * Execute a command
 * @param  {Client} client  the client that is executing the command
 * @param  {Array}  command the array of the command payload
 */
Commands.exec = function(client, command) {
  this.init();

  var name = command.shift();

  console.log("%s sent command: %s", client.name, name);
  //console.log(client);
  if (commands[name] !== undefined) {
    //arguments.shift();
    commands[name].exec(client, name, command);
  }
};

/**
 * Return all commands
 * @return {Array} array of commands loaded
 */
Commands.all = function() {
  this.init();

  return commands;
};

module.exports = Commands;
