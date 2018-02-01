"use strict"

var util = require('util')
var moment = require('moment')
var printf = require('printf')

var Server = require('../core/server')
var Command = require('../core/command')
var Commands = require('../core/commands')
var MessageEvent = require('../core/messageevent')
var Color = require('../core/color')
var Header = require('../core/header')
var Table = require('ascii-table')

new Command('who', 'show who is connected', 1, (sender, name, cmd) => {
    var clients = Server.getInstance().clients

    var table = new Table()
    table.setHeading('Name', 'Idle', 'Account (Lvl)', 'Room', 'Address', 'Version')

    clients.forEach((c, key) => {
        table.addRow(c.name, moment(c.lastEvent.date).fromNow(true), util.format("%s (%s)", c.name, c.account.level), c.room.name, c.ip, c.version)
    })

    var response = "Current chat connections:\n" + table.toString() + "\n"

    MessageEvent.private(response).toClient(sender).send()
})
