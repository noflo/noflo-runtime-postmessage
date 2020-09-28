const exported = {
  // eslint-disable-next-line import/no-extraneous-dependencies
  noflo: require('noflo'),
  'noflo-runtime-postmessage': require('./index'),
};

if (window) {
  window.require = function (moduleName) {
    if (exported[moduleName]) {
      return exported[moduleName];
    }
    throw new Error(`Module ${moduleName} not available`);
  };
}
