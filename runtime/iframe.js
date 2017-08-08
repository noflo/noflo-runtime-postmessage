(function (context) {
  var PostMessage = require('./postmessage');

  var IframeRuntime = function (options) {
    PostMessage.call(this, options);
  };
  IframeRuntime.prototype = new PostMessage;

  module.exports = function (options) {
    options = PostMessage.normalizeOptions(options);
    var runtime = new IframeRuntime(options);
    PostMessage.subscribe(context, function (msg, metadata) {
      if (msg.protocol === 'iframe' && msg.command === 'setcontent') {
        document.body.innerHTML = msg.payload;
        return;
      }
      runtime.receive(msg.protocol, msg.command, msg.payload, {
        href: metadata.origin
      });
    });
    return runtime;
  };
})(window);
