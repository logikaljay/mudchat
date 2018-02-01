const {describe, before, it} = require('mocha')
const {expect} = require('code')

describe('messageevent', function () {
    var MessageEvent = require('../core/messageevent')

    it('returns a MessageEvent with correct properties', function (done) {
        var message = new MessageEvent(null, '04', 'test')
        expect(message).to.be.object()
        expect(message.command).to.equal('04')
        expect(message.data).to.equal('test')
        expect(message.sender).to.equal(null)
        expect(message.buffer()).to.be.buffer()
        expect(message.buffer()[0].toString(16)).to.equal('4')

        done()

    });

    it('returns a public MessageEvent', function(done) {
        var message = MessageEvent.public('test')
        expect(message).to.be.object()
        expect(message.command).to.equal('04')
        expect(message.data).to.equal('test')
        expect(message.sender).to.equal(null)
        expect(message.buffer()).to.be.buffer()
        expect(message.buffer()[0].toString(16)).to.equal('4')

        done()
    });

    it('returns a private MessageEvent', function(done) {
        var message = MessageEvent.private('test')
        expect(message).to.be.object()
        expect(message.command).to.equal('05')
        expect(message.data).to.equal('test')
        expect(message.sender).to.equal(null)
        expect(message.buffer()).to.be.buffer()
        expect(message.buffer()[0].toString(16)).to.equal('5')

        done()
    });

    it('returns a version MessageEvent', function(done) {
        var message = MessageEvent.version('test')
        expect(message).to.be.object()
        expect(message.command).to.equal('13')
        expect(message.data).to.equal('test')
        expect(message.sender).to.equal(null)
        expect(message.buffer()).to.be.buffer()
        expect(message.buffer()[0].toString(16)).to.equal('13')

        done()
    })

})
