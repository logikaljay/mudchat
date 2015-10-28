var name;
var password;
var destroyable;
var silent;
var minLevel;
var chatLog;
var clients = [];
var listeners = [];

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

  return this;
};

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

module.exports = Room;
