describe('IFRAME network runtime', () => {
  let iframe = null;

  const send = function (protocol, command, payload) {
    const msg = {
      protocol,
      command,
      payload,
    };
    const serialized = JSON.stringify(msg);
    return iframe.postMessage(serialized, '*');
  };
  const receive = function (protocol, expects, done) {
    const listener = function (message) {
      const msg = JSON.parse(message.data);
      if (msg.protocol !== protocol) { return; }
      const expected = expects.shift();
      if (!expected) {
        done();
        return;
      }
      if (!expected.payload) {
        chai.expect(msg.command).to.equal(expected.command);
      } else {
        chai.expect(msg).to.eql(expected);
      }
      if (expects.length === 0) {
        window.removeEventListener('message', listener, false);
        done();
      }
    };
    window.addEventListener('message', listener, false);
  };
  before((done) => {
    const iframeElement = document.getElementById('iframe');
    iframe = iframeElement.contentWindow;
    iframeElement.onload = () => done();
  });

  describe('Runtime Protocol', () => describe('requesting runtime metadata', () => it('should provide it back', (done) => {
    const listener = function (message) {
      window.removeEventListener('message', listener, false);
      let msg = message.data;
      msg = JSON.parse(msg);
      chai.expect(msg.protocol).to.equal('runtime');
      chai.expect(msg.command).to.equal('runtime');
      chai.expect(msg.payload).to.be.an('object');
      chai.expect(msg.payload.type).to.equal('noflo-browser');
      chai.expect(msg.payload.capabilities).to.be.an('array');
      done();
    };
    window.addEventListener('message', listener, false);
    send('runtime', 'getruntime', '');
  })));

  describe('Graph Protocol', () => {
    describe('receiving a graph and nodes', () => it('should provide the nodes back', (done) => {
      const expects = [{
        protocol: 'graph',
        command: 'clear',
      },
      {
        protocol: 'graph',
        command: 'addnode',
        payload: {
          id: 'Foo',
          component: 'core/Repeat',
          metadata: {
            hello: 'World',
          },
          graph: 'foo',
        },
      },
      {
        protocol: 'graph',
        command: 'addnode',
        payload: {
          id: 'Bar',
          component: 'core/Drop',
          metadata: {},
          graph: 'foo',
        },
      },
      ];
      receive('graph', expects, done);
      send('graph', 'clear', {
        baseDir: '/noflo-runtime-iframe',
        id: 'foo',
        main: true,
      });
      send('graph', 'addnode', expects[1].payload);
      send('graph', 'addnode', expects[2].payload);
    }));
    describe('receiving an edge', () => it('should provide the edge back', (done) => {
      const expects = [{
        protocol: 'graph',
        command: 'addedge',
        payload: {
          src: {
            node: 'Foo',
            port: 'out',
          },
          tgt: {
            node: 'Bar',
            port: 'in',
            index: 2,
          },
          metadata: {
            route: 5,
          },
          graph: 'foo',
        },
      },
      ];
      receive('graph', expects, done);
      send('graph', 'addedge', expects[0].payload);
    }));
    describe('receiving an IIP', () => it('should provide the IIP back', (done) => {
      const expects = [{
        protocol: 'graph',
        command: 'addinitial',
        payload: {
          src: {
            data: 'Hello, world!',
          },
          tgt: {
            node: 'Foo',
            port: 'in',
          },
          metadata: {},
          graph: 'foo',
        },
      },
      ];
      receive('graph', expects, done);
      send('graph', 'addinitial', expects[0].payload);
    }));
    describe('removing an IIP', () => it('should provide the IIP back', (done) => {
      const expects = [{
        protocol: 'graph',
        command: 'removeinitial',
        payload: {
          src: {
            data: 'Hello, world!',
          },
          tgt: {
            node: 'Foo',
            port: 'in',
          },
          graph: 'foo',
        },
      },
      ];
      receive('graph', expects, done);
      send('graph', 'removeinitial', {
        tgt: {
          node: 'Foo',
          port: 'in',
        },
        graph: 'foo',
      });
    }));
    describe('removing a node', () => it('should remove the node and its associated edges', (done) => {
      const expects = [{
        protocol: 'graph',
        command: 'changeedge',
      },
      {
        protocol: 'graph',
        command: 'removeedge',
        payload: {
          src: {
            node: 'Foo',
            port: 'out',
          },
          tgt: {
            node: 'Bar',
            port: 'in',
            index: 2,
          },
          graph: 'foo',
        },
      },
      {
        protocol: 'graph',
        command: 'changenode',
      },
      {
        protocol: 'graph',
        command: 'removenode',
        payload: {
          id: 'Bar',
          graph: 'foo',
        },
      },
      ];
      receive('graph', expects, done);
      send('graph', 'removenode', {
        id: 'Bar',
        graph: 'foo',
      });
    }));
    describe('renaming a node', () => it('should send the renamenode event', (done) => {
      const expects = [{
        protocol: 'graph',
        command: 'renamenode',
        payload: {
          from: 'Foo',
          to: 'Baz',
          graph: 'foo',
        },
      },
      ];
      receive('graph', expects, done);
      send('graph', 'renamenode', {
        from: 'Foo',
        to: 'Baz',
        graph: 'foo',
      });
    }));
  });

  describe('Network protocol', () => {
    // Set up a clean graph
    beforeEach((done) => {
      let waitFor = 4;
      const listener = function () {
        waitFor -= 1;
        if (waitFor) { return; }
        window.removeEventListener('message', listener, false);
        done();
      };
      window.addEventListener('message', listener, false);
      send('graph', 'clear', {
        baseDir: '/noflo-runtime-postmessage',
        id: 'bar',
        main: true,
      });
      send('graph', 'addnode', {
        id: 'Hello',
        component: 'core/Repeat',
        metadata: {},
        graph: 'bar',
      });
      send('graph', 'addnode', {
        id: 'World',
        component: 'core/Drop',
        metadata: {},
        graph: 'bar',
      });
      send('graph', 'addedge', {
        src: {
          node: 'Hello',
          port: 'out',
        },
        tgt: {
          node: 'World',
          port: 'in',
        },
        graph: 'bar',
      });
      send('graph', 'addinitial', {
        src: {
          data: 'Hello, world!',
        },
        tgt: {
          node: 'Hello',
          port: 'in',
        },
        graph: 'bar',
      });
    });
    describe('on starting the network', () => it('should get started and stopped', function (done) {
      this.timeout(15000);
      const expected = [{
        protocol: 'network',
        command: 'started',
      },
      {
        protocol: 'network',
        command: 'data',
      },
      {
        protocol: 'network',
        command: 'data',
      },
      {
        protocol: 'network',
        command: 'stopped',
      },
      ];
      receive('network', expected, done);
      send('network', 'start',
        { graph: 'bar' });
    }));
  });

  describe('Component protocol', () => describe('on requesting a component list', () => it('should receive some known components', (done) => {
    let received = 0;
    const listener = function (message) {
      const msg = JSON.parse(message.data);
      if (msg.protocol !== 'component') { return; }

      if (msg.command === 'component') {
        chai.expect(msg.payload).to.be.an('object');
        received += 1;

        if (msg.payload.name === 'core/Output') {
          chai.expect(msg.payload.icon).to.equal('bug');
          chai.expect(msg.payload.inPorts).to.eql([{
            id: 'in',
            type: 'all',
            required: false,
            addressable: false,
            description: 'Packet to be printed through console.log',
          },
          {
            id: 'options',
            type: 'object',
            required: false,
            addressable: false,
            description: 'Options to be passed to console.log',
          },
          ]);
          chai.expect(msg.payload.outPorts).to.eql([{
            id: 'out',
            type: 'all',
            required: false,
            addressable: false,
          },
          ]);
        }
      }
      if (msg.command === 'componentsready') {
        chai.expect(msg.payload).to.equal(received);
        chai.expect(received).to.be.above(5);
        window.removeEventListener('message', listener, false);
        done();
      }
    };
    window.addEventListener('message', listener, false);
    send('component', 'list', '/noflo-runtime-postmessage');
  })));
});
