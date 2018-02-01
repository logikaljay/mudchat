const {describe, before, it} = require('mocha')
const {expect} = require('code')

describe('rooms', function () {

    var Room = require('../core/room')
    var Server = require('../core/server')

    var room

    it('returns a Room with correct properties when constructed', function (done) {
        room = new Room('main', 'password', 1)

        expect(room.name).to.equal('main')
        expect(room.password).to.equal('password')
        expect(room.minLevel).to.equal(1)
        done()
    })

    it('returns undefined when using the Room.get() to get a room that doesn\'t exist', function(done) {
        var fake = Room.get('fake')
        expect(fake).to.equal(undefined)
        done()
    })

    it('make sure room doesn\'t exist after it is destroyed', function(done) {
        var server = new Server('chatserver', 4050)
        Server.getInstance().rooms.set('main', new Room('main', 'password', '1'))
        var tmpRoom = Room.get('main')
        expect(tmpRoom).to.not.equal(undefined)
        tmpRoom.destroy()
        expect(Server.getInstance().rooms.get('main')).to.equal(undefined)
        server.stop()
        done()
    })

    it('make sure clients is a Map', function(done) {
        var server = new Server('chatserver', 4050)
        var tmpRoom = Server.getInstance().rooms.get('main')
        expect(tmpRoom.clients).to.be.an.instanceof(Map)
        server.stop()
        done()
    })

    it('make sure listeners is a Map', function(done) {
        var server = new Server('chatserver', 4050)
        var tmpRoom = Server.getInstance().rooms.get('main')
        expect(tmpRoom.listeners).to.be.an.instanceof(Map)
        server.stop()
        done()
    })

    it('make sure silent gets set', function(done) {
        var server = new Server('chatserver', 4050)
        var tmpRoom = Server.getInstance().rooms.get('main')
        tmpRoom.setSilent()
        expect(tmpRoom.silent).to.equal(true)
        server.stop()
        done()
    })

    it('make sure isSilent returns corrently', function(done) {
        var server = new Server('chatserver', 4050)
        var tmpRoom = Server.getInstance().rooms.get('main')
        tmpRoom.setSilent()
        expect(tmpRoom.isSilent()).to.equal(true)
        server.stop()
        done()
    })

    it('make sure clients and listeners are combined correctly', function(done) {
        //var server = new Server('chatserver', 4050)
        var room = new Room('main', 'password', 1)

        // add a bogus client to the room
        room.clients.set('jim', { name: 'jim' })
        room.listeners.set('sam', { name: 'sam' })

        expect(room.clientsAndListeners().size).to.equal(2)

      done()
    })
})
