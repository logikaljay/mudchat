"use strict"

var Commands = require('../core/commands')
var Command = require('../core/command')
var Server = require('../core/server')
var Room = require('../core/room')

new Command('join', 'join a [room]', 0, (sender, name, cmd) => {
    var commands = Commands.all()
    var response

    if (cmd == [] || cmd.length < 1) {
        Commands.exec(sender, ['help', 'join'])
        return
    }

    var room = Server.getInstance().rooms[cmd[0]]
    if (room === undefined) {
        // create the room
        room = Server.getInstance().rooms[cmd[0]] = new Room(cmd[0], null, 0)
    }

    sender.room.leave(sender)
    room.join(sender)
})
