var Account = require('../core/account');

//var acc = new Account('user', 'password', 5);

var acc = new Account('user');

console.log(acc);

console.log(acc.validate('password'));
