"use strict";

var Server = require('../server');
var Commands = require('../core/commands');
var Command = require('../core/command');
var Room = require('../core/room');
var MessageEvent = require('../core/messageevent');

new Command('unlisten', 'stop listening to a [room]', 0, (sender, name, cmd) => {
  if (cmd == [] || cmd.length < 1) {
    Commands.exec(sender, ['help', 'unlisten']);
    return;
  }

  var room = Server.getInstance().rooms[cmd[0]];
  if (room === undefined) {
    // inform the client that this room doesn't exit
    MessageEvent.private('That is not a room').to(sender).send();
  }

  room.removeListener(sender);
});
