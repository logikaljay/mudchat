var Commands = require('../core/commands');

Commands.add('help', 'Show the help messages', 0, function(name, cmd) {
  var commands = Commands.all();

  if (cmd === undefined) {
    // iterate over commands and show the help message for all of them
    for (var command in commands) {
      console.log(commands[command]);
    }
  } else {
    // get the specifc command and show the help message
    if (commands[cmd] !== undefined) {
      console.log(commands[cmd]);
    }
  }
});
