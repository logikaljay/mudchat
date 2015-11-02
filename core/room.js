"use strict";

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
var MessageEvent = require('./messageevent');

/**
 * The room class handles the creation, joining, leaving and all messages posted to rooms
 */
class Room {
  /**
   * Room constructor
   * @constructor
   * @param  {String} roomName  name of the room
   * @param  {String} password  password for the room
   * @param  {Integer} minLevel minimum level for the room
   * @return {Room}             the room object
   */
  constructor(roomName, password, minLevel) {
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
  }

  destroy() {
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
  }

  /**
   * Send a message to all clients in a room
   * @param  {Object} payload the message to send, and the client it was sent from
   */
  send(e) {
    for (var i in this.clients) {
      var client = this.clients[i];

      // console.log("room %s contains %s", this.name, this.clients.length);

      if (e.client === null) {
        client.send(e);
      } else if (client.name !== e.client.name) {
        client.send(e);
      }
    }
  }

  /**
   * Join a room
   * @param  {Client}  client the client to put in the room
   * @param  {Boolean} silent if true, don't advertise it to the room
   */
  join(client, silent) {
    // add the client to this room's list of clients
    this.clients.push(client);

    // set the client's room
    client.room = this;

    if (silent === undefined) {
      this.send({ client: client, data: util.format('%s has joined the room', client.name) });
    }

    new MessageEvent(client, MessageEvent.Type.PRIVATE, util.format("You have joined the '%s' room", this.name)).send();
  }

  /**
   * Leave a room
   * @param  {Object}  client the client to leave the room
   * @param  {Boolean} silent if true, don't advertise it to the room
   */
  leave(client, silent) {
    // remove the client from this room's list of clients
    this.clients = this.clients.filter(function(c) {
      return client.name !== c.name;
    });

    if (silent === undefined) {
      this.send({ client: client, data: util.format('%s has left the room', client.name) });
    }

    // No need to tell the user they have left the room - joining seems good enough.
    // client.send(util.format("You have left the '%s' room", this.name));
  }

  /**
   * Get the room
   * @param  {String} name  the name of the room to get
   * @return {Room}         the room object
   */
  get(name) {
    return Server.getInstance().rooms[name];
  }
}

module.exports = Room;
