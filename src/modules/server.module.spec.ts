import { expect } from "chai";
import * as http from "http";
import * as net from "net";
import { IApp, IConfig, Server } from "./server.module";

describe("Server", () => {
  describe("constructor()", () => {
    it("Should be able to create a new server with no arguments", () => {
      // 1. Arrange
      const MinimumNumberOfApps = 1;

      // 2. Act
      const server = (new Server() as any);

      // 3. Assert
      expect(server.configs.apps.length).to.greaterThan(MinimumNumberOfApps - 1);
    });
  });
  describe("start()", () => {
    it("Should be able to start a server", (done) => {
      // 1. Arrange
      const expectedPort = 1234;

      // 2. Act
      new Server().start().then((listener: http.Server) => {
        // 3. Assert
        expect((listener.address() as net.AddressInfo).port).to.equal(expectedPort);
        listener.close();
        done();
      });
    });
  });
  describe("createApp()", () => {
    it("Should create an app using the vhost lib", () => {
      // 1. Arrange
      const expectedPort = 1234;

      // 2. Act
      const app = (new Server() as any).createApp({ domain: "test.domain" });

      // 3. Assert
      expect(typeof app).to.equal("function");
    });
  });
});
