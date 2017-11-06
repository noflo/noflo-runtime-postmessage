const noflo = require('noflo');
const Base = require('noflo-runtime-base');

const PostMessage = class PostMessage extends Base {
  constructor(options = {}) {
    super(options);
    if (options.catchExceptions) {
      window.onerror = function (err) {
        if (this.client) {
          this.send('network', 'error', err, {
            href: this.context ? this.context.href : this.client.location.href
          });
        }
        console.error(err);
        return true;
      }.bind(this);
    }

    if (!options.defaultPermissions.length) {
      // The iframe runtime is run on user's own computer, so default to all access allowed
      options.defaultPermissions = [
        'protocol:graph',
        'protocol:component',
        'protocol:network',
        'protocol:runtime',
        'component:setsource',
        'component:getsource'
      ];
    }
    this.client = null;
  }

  setClient(client) {
    this.client = client;
  }

  send(protocol, topic, payload, ctx) {
    if (!this.client) {
      return;
    }
    if (payload instanceof Error) {
      payload = {
        message: payload.message,
        stack: payload.stack
      };
    }
    if (this.context) {
      ctx = this.context;
    }
    this.client.postMessage(JSON.stringify({
      protocol: protocol,
      command: topic,
      payload: payload
    }), ctx.href);
    this.prototype.send.apply(this, arguments);
  };
  send(protocol, topic, payload) {
    this.send(protocol, topic, payload, this.context);
  }
  start() {
    // Ignored, nothing to do
  }

  subscribe(ctx, callback) {
    ctx.addEventListener('message', function (message) {
      let data;
      if (typeof message.data === 'string') {
        data = JSON.parse(message.data);
      } else {
        data = message.data;
      }
      if (!data.protocol) {
        return;
      }
      if (!data.command) {
        return;
      }
      callback(data, message);
    });
  }
}
module.exports = PostMessage;
