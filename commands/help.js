var Commands = require('../core/commands');
var Server = require('../core/server');

Commands.add('help', 'Show the help messages', 0, function(client, name, cmd) {
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
