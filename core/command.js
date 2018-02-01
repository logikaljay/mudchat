"use strict"

var Commands = require('./commands')

/**
 * Command class that all the commands in the chat server and its plugins use
 */
class Command {
    /**
     * Creates and adds a command in to the chat server
     * @param {String} name                The name of the command used for invocation
     * @param {String} description The description of the command used for help messages
     * @param {Integer} level            The minimum level required to execute the command
     * @param {Function} exec            The function to be executed
     */
    constructor(name, description, minLevel, exec) {

        // validate the command
        if (name === undefined || name === '') {
            console.log("Error loading command - Command did not supply a name")
            return
        }

        if (description === undefined) {
            console.log("Error loading command '%s' - Command did not have a description", name)
            return
        }

        if (minLevel === undefined || minLevel < 0) {
            console.log("Error loading command '%s' - Command minLevel is not valid", name)
            return
        }

        if (exec === undefined || typeof exec !== 'function') {
            console.log("Error loading command '%s' - Function not supplied")
            return
        }

        this.name = name
        this.description = description
        this.minLevel = minLevel
        this.exec = exec

        Commands.add(this)
    }
}

module.exports = Command
