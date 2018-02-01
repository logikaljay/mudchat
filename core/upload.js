var path = require('path')
var fs = require('fs')
var util = require('util')

var MessageEvent = require('./messageevent')
var { UPLOADSTART, UPLOADDENY, UPLOADBLOCKREQUEST, UPLOADBLOCK, UPLOADEND, UPLOADCANCEL } = MessageEvent.Type

var State = {
    INACTIVE: 0,
    ACTIVE: 1,
    INVALID: 2
}

class Upload {

    constructor(sender, message) {
    
        var data = message.data
        if (data.indexOf(',') === -1) {
            this.state = State.INVALID
            return
        }

        if ( ! sender) {
            this.state = State.INVALID
            return
        }

        data = data.split(',')

        this.client = sender
        this.file = data[0]
        this.size = Number(data[1])
        this.started = new Date()
        this.state = State.ACTIVE
        this.path = path.join('uploads', util.format('%s-%s-%s', this.client.name, this.started.getTime() / 1000, this.file))
        this.received = 0

        sender.sendRaw(UPLOADBLOCKREQUEST)
    }

    receive(sender, message) {

        var offset = 0
        if (this.received + message.data.length > this.size) {
            var offset = (this.received + message.data.length) - this.size
        }

        var data = message.data
        if (offset > 0) {
            data = data.substring(0, message.data.length - offset)
        }

        fs.appendFile(this.path, data, () => {
            this.received += message.data.substring(offset).length

            if (this.received < this.size) {
                sender.sendRaw(UPLOADBLOCKREQUEST)
            }
            else {
                // done
                console.log("!done!")
            }
        })
    }
}

module.exports = Upload