"use strict";

var util = require('util');

var Server = require('../core/server');
var Command = require('../core/command');
var MessageEvent = require('../core/messageevent');
var Account = require('../core/account');
var ANSIColor = require('../core/color');

new Command('del', 'Delete an account', 3, (sender, name, cmd) => {
  var clients = Server.getInstance().clients;
  var help;

  // input should be: del username
  var username = cmd[0];

  // validate the inputs
  if (typeof username === 'undefined') {
    help = util.format("Unable to delete account:\n\t%sInvalid Arguments\n\n" +
                           "\t%sUsage: %s/chat 1 del <name>", ANSIColor.WHT, ANSIColor.RED, ANSIColor.WHT);
    MessageEvent.private(help).toClient(sender).send();
    return;
  }

  // make sure that the user doesn't already exist
  if (!Account.exists(username)) {
    help = util.format("Unable to delete account:\n\t%sUser does not exist\n", ANSIColor.WHT);
    MessageEvent.private(help).toClient(sender).send();
    return;
  }

  // load the account
  var acc = new Account(username);

  // make sure that level is less than, or = the client's level - 3's can't add 4's etc.
  if (client.level < 5) {
    if (acc.level >= client.level) {
      help = util.format("Unable to delete account:\n\t%sYour level is not high enough to remove this account.\n", ANSIColor.WHT);
      MessageEvent.private(help).toClient(sender).send();
      return;
    }
  }

  // delete the account
  Account.delete(username);

  // display the added account message to the main room.
  var room = Server.getInstance().rooms.main;
  var message = util.format("%s Account %s deleted by %s", ANSIColor.header("chatserv"),ANSIColor.name(username),ANSIColor.name(client.name));  
  MessageEvent.public(message).toClients(room.clients).send();
});
