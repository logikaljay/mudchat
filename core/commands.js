var commands = [];

var fs = require('fs');
var path = require('path');

module.exports.load = function() {
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

module.exports.init = function() {
  // only if commands is undefined do we want to action the init
  if (typeof commands === undefined) {
    commands = [];

    this.load();
  }
};

module.exports.add = function(name, description, level, command) {
  this.init();

  commands[name] = { name: name, description: description, level: level, exec: command };
};

module.exports.exec = function(client, command) {
  this.init();

  var name = command.shift();

  console.log("%s sent command: %s", client.name, name);
  //console.log(client);
  if (commands[name] !== undefined) {
    //arguments.shift();
    commands[name].exec(client, name, command);
  }
};

module.exports.all = function() {
  this.init();

  return commands;
};
