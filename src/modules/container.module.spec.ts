process.env.NODE_ENV = "test";

import { expect } from "chai";
import { container } from "./container.module";

class Foo {
  constructor(public bar: string = "Hello World") { }
  public printSomething(): string { return "Printing something"; }
}

class Bar {}

describe("container", () => {
  describe("Reference", () => {
    it("Should be able to set a class as reference", () => {
      // 1. Arrange
      container.set("Foo", Foo);

      const expectedReturn: string = "Printing something";

      // 2. Act
      const fooInstance: typeof Foo = container.get<typeof Foo>("Foo");
      const fooObject = new fooInstance();
      const methodCallResult = fooObject.printSomething();

      // 3. Assert
      expect(fooInstance).to.equal(Foo);
      expect(methodCallResult).to.equal(expectedReturn);
    });
    it("Should be able to set an object as reference", () => {
      // 1. Arrange
      interface objectType { foo: string; bar: number; }
      const testObject: objectType = { foo: "Hello World", bar: 22 };
      container.set("testObject", testObject);

      // 2. Act
      const testObjectInstance = container.get<objectType>("testObject");

      // 3. Assert
      expect(testObjectInstance).to.equal(testObject);
    });
    it("Should be able to getting a reference same time as setting it", () => {
      // 1. Arrange

      // 2. Act
      const fooInstance: typeof Foo = container.get(Foo);

      // 3. Assert
      expect(fooInstance).to.equal(Foo);
    });
  });
  describe("Service", () => {
    it("Should be able to create service as singleton", () => {
      // 1. Arrange
      container.set("Foo", Foo);

      // 2. Act
      const fooService = container.getService(Foo);
      const fooService2 = container.getService(Foo);

      // 3. Assert
      expect(fooService).to.equal(fooService2);
    });
    it("Should be able to create service same time as setting it", () => {
      // 1. Arrange

      // 2. Act
      const fooService = container.getService(Foo);
      const fooService2 = container.getService(Foo);

       // 3. Assert
      expect(fooService).to.equal(fooService2);
    });
  });
  describe("Factory", () => {
    it("Should be able to create instances of a class", () => {
      // 1. Arrange
      container.set("Foo", Foo);
      const expectedResult: string = "Hello World";

      // 2. Act
      const fooInstance: Foo = container.create("Foo");
      const fooInstance2: Foo = container.create("Foo");

      // 3. Assert
      expect(fooInstance.bar).to.equal(expectedResult);
      expect(fooInstance).not.to.equal(fooInstance2);
    });
    it("Should be able to create instance of class same time as setting it", () => {
      // 1. Arrange
      const expectedResult: string = "Hello World";

      // 2. Act
      const fooInstance: Foo = container.create(Foo);

       // 3. Assert
      expect(fooInstance.bar).to.equal(expectedResult);
    });
    it("Should be able to create instance of a class providing constructonal parameters", () => {
      // 1. Arrange
      const expectedResult: string = "Hello universe";

      // 2. Act
      const fooInstance: Foo = container.create(Foo, [expectedResult]);

       // 3. Assert
      expect(fooInstance.bar).to.equal(expectedResult);
    });
  });
  describe("Override", () => {
    it("By default setting an already set reference should not overwrite it", () => {
      // 1. Arrange
      container.set("Foo", Foo);

      // 2. Act
      const barInstance: typeof Bar = container.get("Foo", Bar);

      // 3. Assert
      expect(barInstance).to.not.equal(Bar);
      expect(barInstance).to.equal(Foo);
    });
    it("Should be able to override reference if explicitly saying so", () => {
      // 1. Arrange
      container.set("Foo", Foo);

      // 2. Act
      const barInstance: typeof Bar = container.set("Foo", Bar, true);

      // 3. Assert
      expect(barInstance).to.not.equal(Foo);
      expect(barInstance).to.equal(Bar);
    });
  });
});
