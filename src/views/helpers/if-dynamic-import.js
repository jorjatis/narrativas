module.exports = function noop(entry, options) {
  if (this.file.match(/styles-desktop\.(js|css)/) || this.file.match(new RegExp(`${entry}-desktop\.(js|css)`))) {
    return options.fn(this);
  }
};
