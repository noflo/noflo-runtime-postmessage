const PostMessage = require('./postmessage');
const utils = require('./utils');

class OpenerRuntime extends PostMessage {
  constructor(options, button) {
    super(options);
    if (button) {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.openClient(button.getAttribute('href'));
      });
    }
  }

  openClient(url) {
    const client = window.open(url, '_blank');
    if (!client) {
      throw new Error(`Unable to open client window at '${url}'`);
    }
    this.context = {
      href: '*',
    };
    const handleMessage = function (message) {
      let { data } = message;
      if (typeof message.data === 'string') {
        data = JSON.parse(message.data);
      }

      if (!data.protocol || !data.command) {
        return;
      }
      this.receive(data.protocol, data.command, data.payload, this.context);
    }.bind(this);
    const closeCheck = setInterval(() => {
      if (!client || client.closed) {
        // Client window was closed
        this.setClient(null);
        window.removeEventListener('message', handleMessage);
        clearInterval(closeCheck);
      }
    }, 1000);

    // Register client window and subscribe to messages
    this.setClient(client);
    window.addEventListener('message', handleMessage);
  }
}

module.exports = function (options, button) {
  const normalizedOptions = utils.normalizeOptions(options);
  const runtime = new OpenerRuntime(normalizedOptions, button);
  return runtime;
};
