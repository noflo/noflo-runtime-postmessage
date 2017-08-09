(function (context) {
  var PostMessage = require('./postmessage');

  var OpenerRuntime = function (options, button) {
    PostMessage.call(this, options);
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        this.openClient(button.getAttribute('href'));
      }.bind(this));
    }
  };
  OpenerRuntime.prototype = new PostMessage;

  OpenerRuntime.prototype.openClient = function (url) {
    var client = window.open(url, '_blank');
    if (!client) {
      throw new Error("Unable to open client window");
    }
    this.context = {
      href: '*'
    };
    var handleMessage = function (message) {
      var data;
      if (typeof message.data === 'string') {
        data = JSON.parse(message.data);
      } else {
        data = message.data;
      }

      if (!data.protocol || !data.command) {
        return;
      }

      if (data.protocol === 'iframe' && data.command === 'setcontent') {
        document.body.innerHTML = msg.payload;
        return;
      }
      runtime.receive(data.protocol, data.command, data.payload, {
        href: '*'
      });
    };
    if (client.addEventListener) {
      client.addEventListener('beforeunload', function () {
        // Client window was closed
        runtime.setClient(null);
        window.removeEventListener('message', handleMessage);
      });
    }

    // Register client window and subscribe to messages
    runtime.setClient(client);
    window.addEventListener('message', handleMessage);
  };

  module.exports = function (options, button) {
    options = PostMessage.normalizeOptions(options);
    var runtime = new OpenerRuntime(options, button);
    return runtime;
  };
})(window);

