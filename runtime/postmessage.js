const Base = require('noflo-runtime-base');

class PostMessage extends Base {
  constructor(options = {}) {
    const normalizedOptions = options;
    super(normalizedOptions);
    if (normalizedOptions.catchExceptions) {
      window.onerror = function (err) {
        if (this.client) {
          this.send('network', 'error', err, {
            href: this.context ? this.context.href : this.client.location.href,
          });
        }
        console.error(err);
        return true;
      }.bind(this);
    }

    if (!normalizedOptions.defaultPermissions.length) {
      // The iframe runtime is run on user's own computer, so default to all access allowed
      normalizedOptions.defaultPermissions = [
        'protocol:graph',
        'protocol:component',
        'protocol:network',
        'protocol:runtime',
        'component:setsource',
        'component:getsource',
        'network:data',
        'network:control',
        'network:status',
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
    let normalizedPayload = payload;
    if (payload instanceof Error) {
      normalizedPayload = {
        message: payload.message,
        stack: payload.stack,
      };
    }
    let { context } = this;
    if (!context) {
      context = ctx;
    }
    this.client.postMessage(JSON.stringify({
      protocol,
      command: topic,
      payload: normalizedPayload,
    }), context.href);
    super.send(protocol, topic, payload, context);
  }

  sendAll(protocol, topic, payload) {
    this.send(protocol, topic, payload, this.context);
  }
}

module.exports = PostMessage;
