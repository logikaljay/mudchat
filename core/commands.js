var commands = [];

module.exports.init = function() {
  if (typeof commands === undefined) {
    commands = [];
  }
};

module.exports.add = function(name, description, level, command) {
  this.init();

  commands[name] = { name: name, description: description, level: level, exec: command };
};

module.exports.exec = function(name) {
  this.init();

  if (commands[name] !== undefined) {
    //arguments.shift();
    commands[name].exec.apply(null, arguments);
  }
};

module.exports.all = function() {
  this.init();
  
  return commands;
};
