// init core
var Server = require('./core/server');

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

var server = new Server('chatserver', 4050);
