var name;
var ip;
var port;
var protocol;
var version;
var socket;
var cb;

/**
 * Handshake specific commands
 * @type {Object}
 * @private
 */
var commands = {
  _version: "13",
  _end: "FF"
};

/**
 * Handshake constructor
 * @constructor
 * @param  {Socket}   socket net socket
 * @param  {Function} cb     the callback
 * @todo Get the chatserver's name from some sort of preferences file
 * @todo Get the chatserver's version from some sort of preferences file
 */
var Handshake = function(socket, cb) {
  this.socket = socket;
  this.cb = cb;
  var self = this;
  socket.on('data', function(data) {
    var str = data.toString();
    var nameAndIp = [];

    // check if our handshake data contains the expected :
    if (str.indexOf(':') > -1) {

      // split the string by the :
      var result = str.split(':', 2);

      // check the first part of the string to get the protocol
      if (result[0] == 'CHAT') {
        // MudMaster protocol
        nameAndIp = result[1].split('\n');
        self.protocol = 'mudmaster';
      } else if (result[0] == 'ZCHAT') {
        // ZChat protocol
        nameAndIp = result[1].split('\n');
        self.protocol = 'zchat';
      } else {
        // Unknown protocol
        self.protocol = 'unknown';
        return self;
      }

      // make sure nameAndIp is valid before progressing
      if (nameAndIp.length > 0) {
        // push the new connection to our list of clients
        self.name = nameAndIp[0];
        self.ip = self.socket.remoteAddress;
        self.port = self.socket.remotePort;

        // send the name, TODO: get the name from some sort of config
        self.socket.write('YES:chatserver\n');

        // create the version as hex, TODO: get the version from some sort of config
        var name = "chatserver v0.0.1";
        var hexName = "";
        for (var i = 0; i < name.length; i++) {
          hexName += ''+name.charCodeAt(i).toString(16);
        }

        // send the version
        var version = new Buffer(commands._version + hexName + commands._end, 'hex');
        self.socket.write(version);

        var versionResponse = function(data) {
          if (data[0].toString(16) == commands._version) {
            self.version = data.toString().substring(1, data.length - 2);
          }

          // remove the version listener
          self.socket.removeListener('data', versionResponse);

          // callback with self
          self.cb(self);
        };

        self.socket.on('data', versionResponse);

      } else {

        // callback with undefined
        self.cb();
      }
    }
  });
};

module.exports = Handshake;
