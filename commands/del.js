"use strict";

var util = require('util');
var moment = require('moment');
var printf = require('printf');

var Server = require('../core/server');
var Command = require('../core/command');
var MessageEvent = require('../core/messageevent');
var Account = require('../core/account');
var ANSIColor = require('../core/color');

new Command('del', 'Delete an account', 3, (client, name, cmd) => {
  var clients = Server.getInstance().clients;
  var help;

  // input should be: del username
  var username = cmd[0];

  // validate the inputs
  if (typeof username === 'undefined') {
    help = util.format("Unable to delete account:\n\t%sInvalid Arguments\n\n" +
                           "\t%sUsage: %s/chat 1 del <name>", ANSIColor.WHT, ANSIColor.RED, ANSIColor.WHT);
    new MessageEvent(client, MessageEvent.Type.PRIVATE, help).send();
    return;
  }

  // make sure that the user doesn't already exist
  if (!Account.exists(username)) {
    help = util.format("Unable to delete account:\n\t%sUser does not exist\n", ANSIColor.WHT);
    new MessageEvent(client, MessageEvent.Type.PRIVATE, help).send();
    return;
  }

  // load the account
  var acc = new Account(username);

  // make sure that level is less than, or = the client's level - 3's can't add 4's etc.
  if (client.level < 5) {
    if (acc.level >= client.level) {
      help = util.format("Unable to delete account:\n\t%sYour level is not high enough to remove this account.\n", ANSIColor.WHT);
      new MessageEvent(client, MessageEvent.Type.PRIVATE, help).send();
      return;
    }
  }

  // delete the account
  Account.delete(username);

  // display the added account message to the main room.
  Server.getInstance().rooms.main.send(new MessageEvent(
    null,
    MessageEvent.Type.PUBLIC,
    util.format("%s Account %s deleted by %s",
      ANSIColor.header("chatserv"),
      ANSIColor.name(username),
      ANSIColor.name(client.name))
  ));
});
