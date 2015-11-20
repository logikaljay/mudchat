"use strict";

var Lab = require('lab');
var Code = require('code');
var expect = Code.expect;
var lab = exports.lab = Lab.script();

// test on a different port so we don't fail due to address in use.
var TESTPORT = 5555;

lab.experiment('server', function () {
  var Server = require('../src/server');
  var instance;

  lab.test('returns a Server with correct properties when constructed', function (done) {
    instance = new Server('chatserver', TESTPORT);
    expect(instance.name).to.equal('chatserver');
    expect(instance.port).to.not.be.undefined;
    expect(instance.rooms).to.be.a.object();
    expect(instance.clients).to.be.a.object();
    expect(instance.rooms.get('main')).to.not.equal(undefined);
    instance.stop();

    done();

  });

  lab.test('getInstance should return the current Server object', function(done) {
    instance = new Server('chatserver', TESTPORT);
    expect(Server.getInstance()).to.equal(instance);
    instance.stop();

    done();
  });

  lab.test('server constructor should emit a started event', function(done) {
    process.on('chat.server.started', function(server) {
      done();
    });

    instance = new Server('chatserver', TESTPORT);
  });

  lab.afterEach(function(next) {
    if (typeof instance !== 'undefined') {
      instance.stop();
    }

    next();
  })
});
