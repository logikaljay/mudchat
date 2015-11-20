"use strict";

var util = require('util');

var MessageEvent = require('../core/messageevent');
var Plugin = require('../core/plugin');
var Room = require('../core/room');
var Color = require('../core/color');

var name;

class Hi extends Plugin {
  onLoad() {
    var room = Room.get('main');
    var message = util.format('%s %s', Color.header('hi'), Color.details('plugin', 'loaded'));
    MessageEvent.private(message).toClients(room.clients).send();
  }

  onUnload() {
    var room = Room.get('main');
    var message = util.format('%s %s', Color.header('hi'), Color.details('plugin', 'unloaded'));
    MessageEvent.private(message).toClients(room.clients).send();
  }
}

module.exports = new Hi();
