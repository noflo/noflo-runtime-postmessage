const PostMessage = require('./postmessage');
const utils = require('./utils');

class IframeRuntime extends PostMessage {
  constructor(options) {
    super(options);
    this.setClient(window.parent);
  }
}

module.exports = function (options) {
  const normalizedOptions = utils.normalizeOptions(options);
  const runtime = new IframeRuntime(normalizedOptions);
  utils.subscribe(window, (msg, metadata) => {
    if (msg.protocol === 'iframe' && msg.command === 'setcontent') {
      document.body.innerHTML = msg.payload;
      return;
    }
    runtime.receive(msg.protocol, msg.command, msg.payload, {
      href: metadata.origin,
    });
  });
  return runtime;
};
