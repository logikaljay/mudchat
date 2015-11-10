"use strict";

var Lab = require('lab');
var Code = require('code');
var expect = Code.expect;
var lab = exports.lab = Lab.script();

lab.experiment('server', function () {
  var Server = require('../core/server');
  var instance;

  lab.test('returns a Server with correct properties when constructed', function (done) {
    instance = new Server('chatserver', 4050);
    expect(instance.name).to.equal('chatserver');
    expect(instance.port).to.equal(4050);
    expect(instance.rooms).to.be.a.object();
    expect(instance.clients).to.be.a.object();
    expect(instance.rooms.get('main')).to.not.equal(undefined);
    instance.stop();

    done();

  });

  lab.test('getInstance should return the current Server object', function(done) {
    instance = new Server('chatserver', 4050);
    expect(Server.getInstance()).to.equal(instance);
    instance.stop();

    done();
  });

  lab.test('server constructor should emit a started event', function(done) {
    process.on('chat.server.started', function(server) {
      instance.stop();
      done();
    });

    instance = new Server('chatserver', 4050);
  });
});
