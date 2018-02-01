"use strict"

var Server = require('../core/server')
var Command = require('../core/command')
var Commands = require('../core/commands')
var Table = require('ascii-table')

new Command('help', 'show the help', 0, (sender, name, cmd) => {
    var commands = Commands.all()
    var response


    var table = new Table()
    table.setHeading('Command', 'Level', 'Description')
    table.setAlign(1, Table.CENTER)

    if (cmd === undefined || cmd.length == 0) {
        // iterate over commands and show the help message for all of them
        for (var command in commands) {
            table.addRow(commands[command].name, levelForDisplay(commands[command].minLevel), commands[command].description)
        }
    } else {
        // get the specifc command and show the help message
        if (commands[cmd] !== undefined) {
            table.addRow(commands[cmd].name, levelForDisplay(commands[cmd].minLevel), commands[cmd].description)
        }
        else {
            table = "No such command."
        }
    }

    response = "Your chat commands:\n" + table.toString()
    sender.send(response, true)
})

var levelForDisplay = (level) => {
    return level == 0 ? 'N/a' : level
}