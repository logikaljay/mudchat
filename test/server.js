const {describe, before, after, it} = require('mocha')
const {expect} = require('code')

describe('server', function () {
    var Server = require('../core/server')
    var instance

    it('returns a Server with correct properties when constructed', function (done) {
        instance = new Server('chatserver', 4050)
        expect(instance.name).to.equal('chatserver')
        expect(instance.port).to.equal(4050)
        expect(instance.rooms).to.be.a.object()
        expect(instance.clients).to.be.a.object()
        expect(instance.rooms.get('main')).to.not.equal(undefined)
        instance.stop()

        done()

    })

    it('getInstance should return the current Server object', function(done) {
        instance = new Server('chatserver', 4050)
        expect(Server.getInstance()).to.equal(instance)
        instance.stop()

        done()
    })

    it('server constructor should emit a started event', function(done) {
        process.on('chat.server.started', function(server) {
            done()
        })

        instance = new Server('chatserver', 4050)
    })

    after(function(next) {
        if (typeof instance !== undefined) {
            instance.stop()
        }

        next()
    })
})
