const util = require('handlebars-utils');

module.exports = function(...args) {
  var len = args.length - 1;
  var options = args[len];
  var val = true;

  for (var i = 0; i < len; i++) {
    if (!args[i]) {
      val = false;
      break;
    }
  }

  return util.value(val, this, options);
};
