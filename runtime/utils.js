exports.normalizeOptions = function (options) {
  const normalizedOptions = options;
  if (typeof options.catchExceptions === 'undefined') {
    normalizedOptions.catchExceptions = true;
    if (window.location.search && window.location.search.substring(1) === 'debug') {
      normalizedOptions.catchExceptions = false;
    }
  }
  return normalizedOptions;
};

exports.subscribe = function (ctx, callback) {
  ctx.addEventListener('message', (message) => {
    let { data } = message;
    if (typeof message.data === 'string') {
      data = JSON.parse(message.data);
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
