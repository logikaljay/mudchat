
"use strict";

var util = require('util');
var moment = require('moment');
var printf = require('printf');

var Server = require('../core/server');
var Command = require('../core/command');
var MessageEvent = require('../core/messageevent');
var Account = require('../core/account');
var ANSIColor = require('../core/color');

new Command('add', 'Add an account', 3, (client, name, cmd) => {
  var clients = Server.getInstance().clients;
  var help;

  // input should be: add username password [level]
  var username = cmd[0];
  var password = cmd[1];
  var level = isNaN(cmd[2]) ? 1 : Number(cmd[2]);

  // validate the inputs
  if (typeof username === 'undefined' ||
      typeof password === 'undefined') {

    help = util.format("Unable to add account:\n\t%sInvalid Arguments\n\n" +
                           "\t%sUsage: %s/chat 1 add <name> <password> [level]", ANSIColor.WHT, ANSIColor.RED, ANSIColor.WHT);
    new MessageEvent(client, MessageEvent.Type.PRIVATE, help).send();
    return;
  }

  // make sure that level is less than, or = the client's level - 3's can't add 4's etc.
  if (level >= client.level) {
    level = client.level;
  }

  // make sure that the user doesn't already exist
  if (Account.exists(username)) {
    help = util.format("Unable to add account:\n\t%sUser already exists\n", ANSIColor.WHT);
    new MessageEvent(client, MessageEvent.Type.PRIVATE, help).send();
    return;
  }

  // add the account
  var acc = new Account(username, password, level);

  // display the added account message to the main room.
  Server.getInstance().rooms.main.send(new MessageEvent(
    null,
    MessageEvent.Type.PUBLIC,
    util.format("%s Account %s added by %s",
      ANSIColor.header("chatserv"),
      ANSIColor.detail(username, level),
      ANSIColor.name(client.name))
  ));
});
