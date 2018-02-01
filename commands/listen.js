"use strict"

var Commands = require('../core/commands')
var Command = require('../core/command')
var Server = require('../core/server')
var Room = require('../core/room')
var MessageEvent = require('../core/messageevent')

new Command('listen', 'listen to a [room]', 0, (sender, name, cmd) => {
    var commands = Commands.all()
    var response

    if (cmd == [] || cmd.length < 1) {
        Commands.exec(sender, ['help', 'listen'])
        return
    }

    var room = Server.getInstance().rooms[cmd[0]]
    if (room === undefined) {
        // inform the client that this room doesn't exit
        MessageEvent.private('That is not a room').to(sender).send()
    }

    room.addListener(sender)
})
