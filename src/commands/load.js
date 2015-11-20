"use strict";

var fs = require('fs');
var path = require('path');
var util = require('util');

var Plugin = require('../core/plugin');
var Command = require('../core/command');
var Color = require('../core/color');
var MessageEvent = require('../core/messageevent');

new Command('load', 'load a plugin', 3, (sender, name, cmd) => {
  var message = util.format("%s Attempting to load plugin: %s", Color.header("chatserv"), Color.name(cmd[0]));
  MessageEvent.private(message).toClient(sender).send();

  // check if plugin exists
  var result = Plugin.load(cmd[0]);
  if (!result.loaded) {
    message = util.format("%s Unable to load plugin %s:\n\t%s%s", Color.header("chatserv"), Color.name(cmd[0]), Color.WHT, result.message);
    MessageEvent.private(message).toClient(sender).send();
  }
});
