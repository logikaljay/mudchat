"use strict";

var util = require('util');
var moment = require('moment');

var Server = require('../core/server');
var Command = require('../core/command');
var Commands = require('../core/commands');
var MessageEvent = require('../core/messageevent');

new Command('who', 'show who is connected', 0, (client, name, cmd) => {
  var clients = Server.getInstance().clients;
  var response = "";
  for (var i in clients) {
    var c = clients[i];
    response += util.format("%s %s %s %s \n", c.name, c.room.name, moment(c.connected).calendar(), c.version);
  }

  client.send(response, true);
});
