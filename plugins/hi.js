"use strict";

var util = require('util');

var MessageEvent = require('../core/messageevent');
var Plugin = require('../core/plugin');
var Server = require('../core/server');
var ANSIColor = require('../core/color');

var name;

class Hi extends Plugin {
  onLoad() {
    var room = Server.getInstance().rooms.main;
    room.send(new MessageEvent(null, MessageEvent.Type.PRIVATE, util.format('%s %s', ANSIColor.header('hi'), ANSIColor.details('plugin', 'loaded'))));
  }

  onUnload() {
    var room = Server.getInstance().rooms.main;
    room.send(new MessageEvent(null, MessageEvent.Type.PRIVATE, util.format('%s %s', ANSIColor.header('hi'), ANSIColor.details('plugin', 'unloaded'))));
  }
}

module.exports = new Hi();
