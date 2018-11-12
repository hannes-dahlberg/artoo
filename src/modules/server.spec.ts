import { Server } from './server';
import * as http from 'http';
import * as net from 'net';
import { expect } from 'chai';

describe('constructor()', () => {
  it('Should be able to create a new server by creating a new server object without arguments', (done) => {
    // 1. Arrange
    const expectedPort = {}

    // 2. Act
    new Server().start().then((listener: http.Server) => {
      expect((<net.AddressInfo>listener.address()).port).to.equal(9090);
      done();
    });

    // 3. Assert
  });
  // 1. Arrange
  /*const configs = {
    port: 9090,
    type: 'api',
    domain: 'test.domain',
    routes: null,
    staticPath: '/static_path_test',
  }*/
  // 2. Act

  // 3. Assert
});