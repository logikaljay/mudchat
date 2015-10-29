var Commands = require('../core/commands');
var Server = require('../core/server');
var Room = require('../core/room');

Commands.add('join', 'join a [room]', 0, function(client, name, cmd) {
  var commands = Commands.all();
  var response;

  if (cmd == [] || cmd.length < 1) {
    Commands.exec(client, ['help', 'join']);
    return;
  }

  var room = Server.getInstance().rooms[cmd[0]];
  if (room === undefined) {
    // create the room
    room = Server.getInstance().rooms[cmd[0]] = new Room(cmd[0], null, 0);
  }

  client.room.leave(client);
  room.join(client);
});
