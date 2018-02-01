var config = require('../config.json')
var package = require('../package.json')

// set up defaults
var opts = {
    name: 'chatserver',
    port: 4050,
    passwordTimeout: 30,
    version: package.version
}

module.exports = Object.assign(opts, config)