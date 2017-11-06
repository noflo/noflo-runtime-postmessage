exports.normalizeOptions = function(options) {
  if (typeof options.catchExceptions === 'undefined') {
    options.catchExceptions = true;
    if (window.location.search && window.location.search.substring(1) === 'debug') {
      options.catchExceptions = false;
    }
  }
  return options;
};
