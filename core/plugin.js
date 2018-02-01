"use strict"

var fs = require('fs')
var path = require('path')

class Plugin {
    constructor(name) {
        this.name = name
    }

    validate() {
        if (typeof this.onLoad !== 'function') {
            return {loaded: false, message: 'Plugin has no onLoad function'}
        }

        if (typeof this.onUnload !== 'function') {
            return {loaded: false, message: 'Plugin has no onUnload function'}
        }

        if (typeof this.name === 'undefined') {
            return {loaded: false, message: "Plugin does not declare a name"}
        }

        return {loaded: true}
    }

    static load(name) {
        var pluginsPath = path.join(__dirname, '..', 'plugins')
        var pluginName = name
        if (pluginName.indexOf('.js') == -1) {
            pluginName += ".js"
        }

        var pathToPlugin = path.join(pluginsPath, pluginName)

        // check if plugin exists
        if (fs.existsSync(pathToPlugin)) {
            var plugin = require(pathToPlugin)

            if (plugin.validate()) {
                var server = require('./server').getInstance()
                plugin.onLoad()
                server.plugins.set(plugin.name, plugin)
                return {loaded:true}
            }
        } else {
            return {loaded:false}
        }
    }
}

module.exports = Plugin
