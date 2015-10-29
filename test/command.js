var Commands = require('../core/commands');
require('../commands/help');

var client = {
  send: (s) => {
    console.log(s);
  }
};

Commands.exec(client, ['help']);
