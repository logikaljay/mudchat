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

    this.clients = new Map();
    this.listeners = new Map();

    process.emit('chat.room.create', this);
    //process.on('chat.client.message.room', (messageEvent) => {
    //  messageEvent.toClients(this.clientsAndListeners()).not(messageEvent.sender).send();
    //});
  }

  static get(name) {
    var Server = require('./server');
    if (Server.getInstance()) {
      var rooms = Server.getInstance().rooms;
      return rooms.get(name);
    } else {
      return undefined;
    }
  }

  setSilent(value) {
    this.silent = value || true;
  }

  isSilent() {
    return this.silent;
  }

  destroy() {
    // get the chat server
    var self = this;
    var Server = require('./server');
    Server.getInstance().rooms.delete(this.name);
  }

  /**
   * Join a room
   * @param  {Client}  client the client to put in the room
   * @param  {Boolean} silent if true, don't advertise it to the room
   */
  join(client, silent) {
    let publicMessage = util.format("%s has joined the '%s' room", client.name, this.name);
    let privateMessage = util.format("You have joined the '%s' room", this.name);

    // add the client to this room's list of clients
    this.clients.set(client.name, client);

    // set the client's room
    client.room = this;

    // send a message to the room
    if (silent === undefined) {
      MessageEvent.public(publicMessage).toClients(this.clientsAndListeners()).not(client).send();
    }

    // send a message to the client
    MessageEvent.private(privateMessage).toClient(client).send();
  }

  /**
   * Leave a room
   * @param  {Object}  client the client to leave the room
   * @param  {Boolean} silent if true, don't advertise it to the room
   */
  leave(client, silent) {
    let publicMessage = util.format('%s has left the room', client.name);

    // remove the client from this room
    this.clients.delete(client.name);

    // announce
    if (silent === undefined) {
      MessageEvent.public(publicMessage).toClients(this.clientsAndListeners()).not(client).send();
    }

    // No need to tell the user they have left the room - joining seems good enough.
    // client.send(util.format("You have left the '%s' room", this.name));
  }

  clientsAndListeners() {
    var result = [];

    for (let value of this.clients.values()) {
      result.push(value);
    }

    for (let value of this.listeners.values()) {
      result.push(value);
    }

    return result;
  }
}

module.exports = Room;
