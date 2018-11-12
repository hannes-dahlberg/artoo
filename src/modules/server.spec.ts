import { Server } from './server';
import * as http from 'http';
import * as net from 'net';
import { expect } from 'chai';

describe('Server', () => {
  describe('constructor()', () => {
    it('Should be able to create a new server with no arguments', () => {
      // 1. Arrange
      const MinimumNumberOfApps = 1;
      
      // 2. Act
      const server = new Server();

      // 3. Assert
      expect(server['configs'].apps.length).to.greaterThan(MinimumNumberOfApps - 1);
    });
  });
  describe('start()', () => {
    it('Should be able to start a server', (done) => {
      // 1. Arrange
      const expectedPort = 9090;

      // 2. Act
      new Server().start().then((listener: http.Server) => {
        // 3. Assert
        expect((<net.AddressInfo>listener.address()).port).to.equal(expectedPort);
        listener.close();
        done();
      });
    });
  })
});