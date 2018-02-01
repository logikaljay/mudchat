"use strict"

var commands = []

var fs = require('fs')
var path = require('path')

var MessageEvent = require('./messageevent')

/**
 * Commands class used to by the chat server and its plugins to manage the list of commands
 */
class Commands {
    /**
     * Add a command into the chat servers list
     * @param {Command} command the Command to add
     */
    static add(command) {
        this.init()

        commands[command.name] = command
    }

    /**
     * Return all commands
     * @return {Array} array of commands loaded
     */
    static all() {
        this.init()

        return commands
    }

    /**
     * Execute a command
     * @param    {Client} client    the client that is executing the command
     * @param    {Array}    command the array of the command payload
     */
    static exec(sender, command) {
        this.init()

        // get the name of the command by shifting the array
        var name = command.shift()

        // make sure our command isnt undefined
        if (commands[name] !== undefined) {

            // make sure that the user is able to execute this command
            if (sender.account.level >= commands[name].minLevel) {
                commands[name].exec(sender, name, command)
            } else {
                MessageEvent.private('Sorry! you do not have permission to do that.').toClient(sender).send()
            }
        }
    }

    /**
     * Init the commands and load them if not initalised
     */
    static init() {
        // only if commands is undefined do we want to action the init
        if (typeof commands === undefined) {
            commands = []

            this.load()
        }
    }

    /**
     * Load all the commands from ./commands directory
     */
    static load() {
        var cmdsDir = path.join(__dirname, '../commands')
        var files = fs.readdirSync(cmdsDir)

        process.emit('chat.commands.loading', files)

        for (var file in files) {
            try {
                require(path.join(cmdsDir, files[file]))
            } catch (e) {
                console.log("Error loading command '%s':\n %s", files[file], e)
            }
        }
    }
}

module.exports = Commands
