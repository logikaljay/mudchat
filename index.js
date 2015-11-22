// init core
var Server = require('./src/server');

process.on('chat.server.started', function(server) {
  console.log("Chat server started on port %s:%s", server._server.address().address, server.port);
});

process.on('chat.client.connection', function(socket) {
  console.log("New connection from %s", socket.remoteAddress + ":" + socket.remotePort);
});

process.on('chat.client.handshake', function(client) {
  console.log('%s has connected with %s using %s', client.name, client.ip + ":" + client.port, client.protocol);
});

process.on('chat.room.create', function(room) {
  console.log("Room created: %s", room.name);
});

process.on('chat.commands.loading', function(data) {
  console.log('Loading %s commands', data.length);
});

/*
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});
*/


var server = new Server();

var repl = require('repl');
var r = repl.start('> ');

// setup the context for the repl.
r.context.server = server;
r.context.clients = server.clients;
r.context.rooms = server.rooms;
r.context.plugins = server.plugins;

// add a send command to send a message
r.defineCommand('send', {
  help: 'send a message to [clients]',
  action: function(client, message) {

    var MessageEvent = require('./core/messageevent');

    if (message !== undefined) {
      // send a message to a specific client
      var to = server.clients.get(client);
      if (to !== undefined) {
        MessageEvent.private(message).toClient(to).send();
      } else {
        console.log("Could not find a client with the name '%s'", client);
      }
    } else {
      // send a message to all clients
      MessageEvent.private(client).toClients(server.clients).send();
    }

    this.displayPrompt();
  }
});

// add a kill command to kill a connection
r.defineCommand('kill', {
  help: 'kill a client',
  action: function(client, message) {
    var c = server.clients.get(client);
    var msg = "Your connection has been closed by the server administator.";
    if (message) {
      msg = message;
    }
    
    if (c) {
      c.kill(msg); 
    }
    
    this.displayPrompt();
  }
});