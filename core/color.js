"use strict";

var util = require('util');

const ANSIColor = {
  NRM: chr(27) + "[0m",
  BLD: chr(27)+ "[1m",
	DAR: chr(27) + "[2m",
	UND: chr(27) + "[4m",
	BLN: chr(27) + "[5m",
	REV: chr(27) + "[7m",
	BLK: chr(27) + "[30m",
	RED: chr(27) + "[31m",
	GRN: chr(27) + "[32m",
	YEL: chr(27) + "[33m",
	BLU: chr(27) + "[34m",
	MAG: chr(27) + "[35m",
	CYN: chr(27) + "[36m",
	WHT: chr(27) + "[37m"
};

function chr(num) {
  //  discuss at: http://phpjs.org/functions/chr/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Brett Zamir (http://brett-zamir.me)
  //   example 1: chr(75) === 'K';
  //   example 1: chr(65536) === '\uD800\uDC00';
  //   returns 1: true
  //   returns 1: true

  if (num > 0xFFFF) { // Create a four-byte string (length 2) since this code point is high
    //   enough for the UTF-16 encoding (JavaScript internal use), to
    //   require representation with two surrogates (reserved non-characters
    //   used for building other characters; the first is "high" and the next "low")
    num -= 0x10000;
    return String.fromCharCode(0xD800 + (num >> 10), 0xDC00 + (num & 0x3FF));
  }

  return String.fromCharCode(num);
}

ANSIColor.header = function(name) {
 return util.format("%s[%s%s%s]", ANSIColor.RED, ANSIColor.WHT, (name !== undefined ? name : "chatserv"), ANSIColor.RED);
};

ANSIColor.name = function(name) {
  return util.format('%s%s%s', ANSIColor.WHT, name, ANSIColor.RED);
};

ANSIColor.brackets = function(outer, inner) {
  return util.format('%s%s%s(%s%d%s)%s', ANSIColor.WHT, outer, ANSIColor.YEL, ANSIColor.WHT, inner, ANSIColor.YEL, ANSIColor.RED);
};

ANSIColor.details = function(left, right) {
  return util.format('%s%s%s: %s%s%s', ANSIColor.RED, left, ANSIColor.YEL, ANSIColor.WHT, right, ANSIColor.RED);
};

module.exports = ANSIColor;
