const PostMessage = require('./postmessage');
const utils = require('./utils');

const IframeRuntime = class IframeRuntime extends PostMessage {
  constructor(options) {
    super(options);
    this.setClient(window.parent);
  }
};

module.exports = function (options) {
  options = utils.normalizeOptions(options);
  const runtime = new IframeRuntime(options);
  PostMessage.subscribe(window, function (msg, metadata) {
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
