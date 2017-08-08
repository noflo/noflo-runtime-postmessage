(function (context) {
  var PostMessage = require('./postmessage');

  var ParentRuntime = function (options) {
    PostMessage.call(this, options);
  };
  ParentRuntime.prototype = new PostMessage;

  module.exports = function (options) {
    options = PostMessage.normalizeOptions(options);
    var runtime = new ParentRuntime(options);
    return runtime;
  };
})(window);

