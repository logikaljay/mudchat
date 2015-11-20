'use strict';

var fs = require('fs');
var util = require('util');
var path = require('path');

const SETTINGS_FILE = path.join(__dirname, "../../data/settings.json");

class Settings {
	constructor(settings) {
		util._extend(this, settings);
	}
	
	static load() {
		if (!fs.existsSync(SETTINGS_FILE)) {
			fs.writeFileSync(SETTINGS_FILE, '{}', 'utf8');
		}
		
		var data = fs.readFileSync(SETTINGS_FILE).toString();
		return new Settings(JSON.parse(data));
	}
	
	static clear() {
		if (!fs.existsSync(SETTINGS_FILE)) {
			fs.writeFileSync(SETTINGS_FILE, '{}', 'utf8');
		}
	}
	
	save() {
		var data = JSON.stringify(this);
		fs.writeFileSync(SETTINGS_FILE, data, 'utf8');
	}
}
module.exports = Settings;