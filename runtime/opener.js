(function (context) {
  var PostMessage = require('./postmessage');

  var OpenerRuntime = function (options) {
    PostMessage.call(this, options);
  };
  OpenerRuntime.prototype = new PostMessage;

  module.exports = function (options) {
    options = PostMessage.normalizeOptions(options);
    var runtime = new OpenerRuntime(options);
    return runtime;
  };
})(window);

