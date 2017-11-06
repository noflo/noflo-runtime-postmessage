const PostMessage = require('./postmessage');
const utils = require('./utils');

const OpenerRuntime = class OpenerRuntime extends PostMessage {
  constructor(options, button) {
    super(options);
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        this.openClient(button.getAttribute('href'));
      }.bind(this));
    }
  }

  openClient(url) {
    const client = window.open(url, '_blank');
    if (!client) {
      throw new Error("Unable to open client window");
    }
    this.context = {
      href: '*'
    };
    const handleMessage = function (message) {
      let data;
      if (typeof message.data === 'string') {
        data = JSON.parse(message.data);
      } else {
        data = message.data;
      }

      if (!data.protocol || !data.command) {
        return;
      }
      this.receive(data.protocol, data.command, data.payload, this.context);
    }.bind(this);
    const closeCheck = setInterval(function () {
      if (!client || client.closed) {
        // Client window was closed
        this.setClient(null);
        window.removeEventListener('message', handleMessage);
        clearInterval(closeCheck);
      }
    }.bind(this), 1000);

    // Register client window and subscribe to messages
    this.setClient(client);
    window.addEventListener('message', handleMessage);
  }
};

module.exports = function (options, button) {
  options = utils.normalizeOptions(options);
  var runtime = new OpenerRuntime(options, button);
  return runtime;
};
