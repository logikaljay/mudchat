"use strict";

var Lab = require('lab');
var Code = require('code');
var expect = Code.expect;
var lab = exports.lab = Lab.script();

var Settings = require('../src/core/settings');

lab.experiment('settings', function () {
	lab.test('should load settings file', function (done) {
		var settings = Settings.load();
		expect(settings).to.be.a.object();
		done();
	});
	
	lab.test('should set a setting', function(done) {
		var settings = Settings.load();
		var date = new Date().toString();
		settings.tested = date;
		expect(settings.tested).to.be.equal(date);
		done();
	});
	
	lab.test('should save a setting', function(done) {
		var settings = Settings.load();
		var date = new Date().toString();
		settings.tested = date;
		settings.save();
		
		var newSettings = Settings.load();
		expect(newSettings.tested).to.be.equal(date.toString());
		done();
	})
});