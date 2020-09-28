const exported = {
  'noflo-runtime-postmessage': require('./index.js'),
};
window.require = function (moduleName) {
  if (typeof exported[moduleName] !== 'undefined') {
    return exported[moduleName];
  }
  throw new Error(`Module ${moduleName} not available`);
};
