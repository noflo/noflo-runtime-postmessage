(function (context) {
  var noflo = require('noflo');
  var Base = require('noflo-runtime-base');

  var PostMessage = function (options) {
    if (!options) {
      options = {};
    }

    if (options.catchExceptions) {
      context.onerror = function (err) {
        if (this.client) {
          self.send('network', 'error', {
            message: err.toString()
          }, {
            href: this.context ? this.context.href : this.client.location.href
          });
        }
        console.error(err);
        return true;
      }.bind(this);
    }

    if (!options.defaultPermissions) {
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

    this.prototype.constructor.apply(this, arguments);
    this.receive = this.prototype.receive;
    this.canDo = this.prototype.canDo;
    this.getPermitted = this.prototype.getPermitted;
    this.client = null;
  };
  PostMessage.prototype = Base;
  PostMessage.prototype.setClient = function (client) {
    this.client = client;
  };
  PostMessage.prototype.send = function (protocol, topic, payload, ctx) {
    if (!this.client) {
      return;
    }
    if (payload instanceof Error) {
      payload = {
        message: payload.toString()
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
  PostMessage.prototype.sendAll = function (protocol, topic, payload) {
    this.send(protocol, topic, payload, window.context);
  };
  PostMessage.prototype.start = function () {
    // Ignored, nothing to do
  };

  PostMessage.normalizeOptions = function (options) {
    if (typeof options.catchExceptions === 'undefined') {
      options.catchExceptions = true;
      if (context.location.search && context.location.search.substring(1) === 'debug') {
        options.catchExceptions = false;
      }
    }
    return options;
  };

  PostMessage.subscribe = function (ctx, callback) {
    ctx.addEventListener('message', function (message) {
      var data;
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
  };

  module.exports = PostMessage;
})(window);
