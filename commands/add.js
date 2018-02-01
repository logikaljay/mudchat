"use strict"

var util = require('util')

var Server = require('../core/server')
var Command = require('../core/command')
var MessageEvent = require('../core/messageevent')
var Account = require('../core/account')
var Color = require('../core/color')

new Command('add', 'Add an account', 3, (sender, name, cmd) => {
    var clients = Server.getInstance().clients
    var help

    // input should be: add username password [level]
    var username = cmd[0]
    var password = cmd[1]
    var level = isNaN(cmd[2]) ? 1 : Number(cmd[2])

    // validate the inputs
    if (typeof username === 'undefined' ||
            typeof password === 'undefined') {

        help = util.format("Unable to add account:\n\t%sInvalid Arguments\n\n" +
                                                     "\t%sUsage: %s/chat 1 add <name> <password> [level]", Color.WHT, Color.RED, Color.WHT)
        MessageEvent.private(help).toClient(sender).send()
        return
    }

    // make sure that level is less than, or = the client's level - 3's can't add 4's etc.
    if (level >= sender.level) {
        level = sender.level
    }

    // make sure that the user doesn't already exist
    if (Account.exists(username)) {
        help = util.format("Unable to add account:\n\t%sUser already exists\n", Color.WHT)
        MessageEvent.private(help).toClient(sender).send()
        return
    }

    // add the account
    var acc = new Account(username, password, level)

    // display the added account message to the main room.
    var room = Server.getInstance().rooms.main
    var message = util.format("%s Account %s added by %s", Color.header("chatserv"),Color.brackets(username, level),Color.name(client.name))
    MessageEvent.public(message).toClients(room.clients).send()
})
