"use strict";

var util = require('util');
var moment = require('moment');
var printf = require('printf');

var Server = require('../core/server');
var Command = require('../core/command');
var Commands = require('../core/commands');
var MessageEvent = require('../core/messageevent');
var ANSIColor = require('../core/color');

new Command('who', 'show who is connected', 1, (client, name, cmd) => {
  var clients = Server.getInstance().clients;
  var response = "";

  const HEADER = util.format("Current chat connections:\n%s[ %sName             %s][ %sIdle         %s][ %sAccount (Lvl)    %s][ %sRoom     %s][ %sAddress           %s][ %sVersion     %s]\n" +
    "%s ------------------  --------------  ------------------  ----------  -------------------  -------------\n",
    ANSIColor.BLU, ANSIColor.WHT, ANSIColor.BLU, ANSIColor.WHT, ANSIColor.BLU, ANSIColor.WHT, ANSIColor.BLU, ANSIColor.WHT, ANSIColor.BLU, ANSIColor.WHT, ANSIColor.BLU, ANSIColor.WHT, ANSIColor.BLU, ANSIColor.WHT);

  response += HEADER;

  for (var i in clients) {
    var c = clients[i];
    response += printf("  %s%-18s %s%-16s %s%-18s  %s%-10s  %s%-19s  %-10s\n",
      ANSIColor.GRN, c.name, ANSIColor.RED, moment(c.lastEvent.date).fromNow(true), ANSIColor.GRN, util.format("%s (%s)", c.name, c.account.level), ANSIColor.CYN, c.room.name, ANSIColor.YEL, c.ip, c.version);
  }

  MessageEvent.private(response).toClient(client).send();
});
