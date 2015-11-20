"use strict";

var util = require('util');
var moment = require('moment');
var printf = require('printf');

var Server = require('../server');
var Command = require('../core/command');
var Commands = require('../core/commands');
var MessageEvent = require('../core/messageevent');
var Color = require('../core/color');

new Command('who', 'show who is connected', 1, (sender, name, cmd) => {
  var clients = Server.getInstance().clients;
  var response = "";

  const HEADER = util.format("Current chat connections:\n%s[ %sName             %s][ %sIdle         %s][ %sAccount (Lvl)    %s][ %sRoom     %s][ %sAddress           %s][ %sVersion     %s]\n" +
    "%s ------------------  --------------  ------------------  ----------  -------------------  -------------\n",
    Color.BLU, Color.WHT, Color.BLU, Color.WHT, Color.BLU, Color.WHT, Color.BLU, Color.WHT, Color.BLU, Color.WHT, Color.BLU, Color.WHT, Color.BLU, Color.WHT);

  response += HEADER;

  for (var i in clients) {
    var c = clients[i];
    response += printf("  %s%-18s %s%-16s %s%-18s  %s%-10s  %s%-19s  %-10s\n",
      Color.GRN, c.name, Color.RED, moment(c.lastEvent.date).fromNow(true), Color.GRN, util.format("%s (%s)", c.name, c.account.level), Color.CYN, c.room.name, Color.YEL, c.ip, c.version);
  }

  MessageEvent.private(response).toClient(sender).send();
});
