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

var Color = require('./color');
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
  }

  /**
   * Return a room by its name
   * @param  {string} name the name of the room
   * @return {Object}      the room to return
   */
  static get(name) {
    var Server = require('../server');
    if (Server.getInstance()) {
      var rooms = Server.getInstance().rooms;
      return rooms.get(name);
    } else {
      return undefined;
    }
  }

  /**
   * Set the silent state of the room
   * @param {Boolean} value true will set the room to silent, false will allow communcation over the room
   */
  setSilent(value) {
    this.silent = value || true;
  }

  /**
   * Check if the room is in a silent state or not
   * @return {Boolean} true if the room is silent
   */
  isSilent() {
    return this.silent;
  }

  /**
   * Destroy the room
   */
  destroy() {
    // get the chat server
    var Server = require('../server');
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

  /**
   * Add a listener to the Map
   * @param {Object} client the client to add to the Map
   * @param {Boolean} silent if true, inform the room of the event
   */
  addListener(client, silent) {
    let publicMessage = util.format('%s is now listening to this room.', client.name);
    let privateMessage = util.format("You are now listening to %s", Color.header(this.name));

    this.listeners.set(client.name, client);

    if (silent === undefined) {
      MessageEvent.public(publicMessage).toClients(this.clientsAndListeners()).not(client).send();
    }

    MessageEvent.private(privateMessage).toClient(client).send();
  }

  /**
   * Remove a listener from the Map
   * @param  {Object} client the client to remove from the Map
   * @param  {Boolean} silent if true, inform the room of the event
   */
  removeListener(client, silent) {
    let publicMessage = util.format('%s has stopped listening to this room.', client.name);
    let privateMessage = util.format("You are no longer listening to %s", Color.header(this.name));

    // remove the client from this room
    this.listeners.delete(client.name);

    // announce
    if (silent === undefined) {
      MessageEvent.public(publicMessage).toClients(this.clientsAndListeners()).not(client).send();
    }

    MessageEvent.private(privateMessage).toClient(client).send();
  }

  /**
   * return Map of clients and listeners
   * @return {Map} Map of clients and listeners
   */
  clientsAndListeners() {
    var result = new Map();

    for (let value of this.clients.values()) {
      result.set(value.name, value);
    }

    for (let value of this.listeners.values()) {
      result.set(value.name, value);
    }

    return result;
  }
}

module.exports = Room;
