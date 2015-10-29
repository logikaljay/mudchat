var name;
var password;
var destroyable;
var silent;
var minLevel;
var chatLog;
var clients = [];
var listeners = [];

var util = require('util');
var Server = require('./server');

/**
 * Room constructor
 * @constructor
 * @param  {String} roomName  name of the room
 * @param  {String} password  password for the room
 * @param  {Integer} minLevel minimum level for the room
 * @return {Room}             the room object
 */
var Room = function(roomName, password, minLevel) {
  this.name = roomName;
  this.password = password;
  this.minLevel = minLevel;

  this.destroyable = true;
  this.silent = false;

  this.clients = [];
  this.listeners = [];

  if (this.name !== "main") {
    var lvlString = minLevel > 0 ? "(minLvl "+this.minLvl+")" : "";
  }

  process.emit('chat.room.create', this);
  process.on('chat.client.message.room', this.send.bind(this));

  return this;
};

/**
 * Destroy a room
 */
Room.prototype.destroy = function() {
  // get the chat server
  var self = this;
  var Server = require('./server');
  var rooms = Server.getInstance().rooms;

  // remove this room from the list of rooms
  rooms = rooms.filter(function(room) {
    console.log("Removing '" + room.name + "': " + (room.name == self.name));
    return room.name !== self.name;
  });
  Server.getInstance().rooms = rooms;

  // because this is no longer referenced, it should get GC'd
};

/**
 * Send a message to all clients in a room
 * @param  {Object} payload the message to send, and the client it was sent from
 */
Room.prototype.send = function(payload) {
  for (var i in this.clients) {
    var client = this.clients[i];

    // console.log("room %s contains %s", this.name, this.clients.length);

    if (payload.client === null) {
      client.send(payload.data, false);
    } else if (client.name !== payload.client.name) {
      client.send(payload.data, false);
    }
  }
};

/**
 * Join a room
 * @param  {Client}  client the client to put in the room
 * @param  {Boolean} silent if true, don't advertise it to the room
 */
Room.prototype.join = function(client, silent) {
  this.clients.push(client);
  client.room = this;
  if (silent === undefined) {
    this.send({ client: client, data: util.format('%s has joined the room', client.name) });
  }

  client.send(util.format("You have joined the '%s' room", this.name));
};

/**
 * Leave a room
 * @param  {Object}  client the client to leave the room
 * @param  {Boolean} silent if true, don't advertise it to the room
 */
Room.prototype.leave = function(client, silent) {
  this.clients = this.clients.filter(function(c) {
    return client.name !== c.name;
  });

  if (silent === undefined) {
    this.send({ client: client, data: util.format('%s has left the room', client.name) });
  }

  // No need to tell the user they have left the room - joining seems good enough.
  // client.send(util.format("You have left the '%s' room", this.name));
};

/**
 * Get the room
 * @param  {String} name  the name of the room to get
 * @return {Room}         the room object
 */
Room.prototype.get = function(name) {
  return Server.getInstance().rooms[name];
};

module.exports = Room;
