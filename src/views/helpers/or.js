module.exports = function(...args) {
  var len = args.length - 1;

  for (var i = 0; i < len; i++) {
    if (args[i]) {
      return args[i];
    }
  }
  return ''; 
};
