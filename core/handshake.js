"use strict"

var util = require('util')

var MessageEvent = require('./messageevent')
var Config = require('./config')

/**
 * Coordinate the connection of a new chat client to the server.
 * Different chat clients send the information differently, so far this chat server supports: TinTin++, mudjs, MudMaster, MudMaster 2k6, ZChat
 */
class Handshake {

    /**
     * Handshake constructor
     * Constructs a new handshake object to process new connections to the chatserver
     * @param    {Socket}     socket        nodejs net socket object
     * @param    {Function} callback    the callback that will be processed once the handshake has completed
     * @todo Get the chatserver's name from some sort of preferences file
     * @todo Get the chatserver's version from some sort of preferences file
     */
    constructor(socket, callback) {
        this.socket = socket
        this.cb = callback

        socket.on('data', data => {
            var str = data.toString()
            var nameAndIp = []

            // check if our handshake data contains the expected :
            if (str.indexOf(':') > -1) {

                // set the connection's protocol information
                this.setProtocol(str)

                // send the chat name of the server to the client
                this.setName('chatserver')

                // send the version of the chatserver to the client
                this.setVersion(`chatserver v${Config.version}`)

                // setup the version response listener to get the client's version
                this.socket.on('data', data => this.getVersion(data))
            }
        })
    }

    /**
     * Set the protocol of the handshake
     * @param {String} protocolStr colon and new line delimitered string of the handshake data
     */
    setProtocol(protocolStr) {
        // split the protocol string by the :
        var result = protocolStr.split(':', 2)

        // check the first part of the result to get the protocol
        if (result[0] == 'CHAT') {
            // MudMaster protocol
            this.protocol = 'mudmaster'
        } else if (result[0] == 'ZCHAT') {
            // ZChat protocol
            this.protocol = 'zchat'
        } else {
            // Unknown protocol
            this.protocol = 'unknown'
        }

        // get the name and ip from the second part of the result
        this.name = result[1].split('\n')[0]
        this.ip = this.socket.remoteAddress
        this.port = this.socket.remotePort
    }

    /**
     * Send the chat servers name to the client
     * @param {String} name the name of the chat server
     */
    setName(name) {
        this.socket.write(util.format('YES:%s\n', name))
    }

    /**
     * Send the chat servers version to the client
     * @param {String} version the version of the chatserver
     */
    setVersion(version) {
        // create the version as hex
        var hexVersion = ""
        for (var i = 0; i < version.length; i++) {
            hexVersion += ''+version.charCodeAt(i).toString(16)
        }

        // send the version
        MessageEvent.version(version).toSocket(this.socket).send()
    }

    /**
     * Get the chat client's version
     * @param    {String} data the data received over the socket
     */
    getVersion(data) {
        if (data[0].toString(16) == MessageEvent.Type.VERSION) {
            this.version = data.toString().substring(1, data.length - 2)
        }

        // remove all the listeners for 'data' on the socket as we don't want getVersion called over and over
        this.socket.removeAllListeners('data')

        // callback with self
        this.cb(this)
    }
}

module.exports = Handshake
