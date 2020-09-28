module.exports = function () {
  // Project configuration
  this.initConfig({
    pkg: this.file.readJSON('package.json'),

    // Browser version building
    noflo_browser: {
      build: {
        files: {
          'browser/noflo-runtime-postmessage.js': ['./loader.js'],
        },
      },
    },

    // Automated recompilation and testing when developing
    watch: {
      files: ['spec/*.js', 'runtime/*.js'],
      tasks: ['test'],
    },

    // Web server for the browser tests
    connect: {
      spec: {
        options: {
          port: 8000,
        },
      },
      iframe: {
        options: {
          port: 8001,
        },
      },
      client: {
        options: {
          port: 8002,
        },
      },
    },

    // BDD tests on browser
    mocha_phantomjs: {
      all: {
        options: {
          output: 'spec/result.xml',
          reporter: 'spec',
          urls: ['http://localhost:8000/spec/runner.html'],
          failWithOutput: true,
        },
      },
    },
  });

  // Grunt plugins used for building
  this.loadNpmTasks('grunt-noflo-browser');

  // Grunt plugins used for testing
  this.loadNpmTasks('grunt-contrib-watch');
  this.loadNpmTasks('grunt-contrib-connect');
  this.loadNpmTasks('grunt-mocha-phantomjs');

  // Our local tasks
  this.registerTask('build', ['noflo_browser']);
  this.registerTask('test', ['noflo_browser', 'connect', 'mocha_phantomjs']);
  return this.registerTask('default', ['test']);
};
