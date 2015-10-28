var net = require('net');

var client = net.connect({ port: 4050}, function() {
  console.log("connected!");
  client.write('hello!\n');
});

client.on('data', function(data) {
  console.log(data.toString());
});

client.on('end', function() {
  console.log('disconnected from server!');
});
