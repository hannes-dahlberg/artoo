import { expect } from "chai";
import * as helpers from "./helpers";

describe("helpers", () => {
  describe("substr()", () => {
    it("should return part of string defined by start and end index pointer", () => {
      // 1. Arrange
      const testString: string = "Hello World";
      const start: number = 2;
      const end: number = 6;
      const expectedResult: string = "llo Wo";

      // 2. Act
      const result: string = helpers.substr(testString, start, end);

      // 3. Assert
      expect(result).to.equal(expectedResult);
    });

    it("Should be able to use negative values for start and end", () => {
      // 1. Arrange
      const testString: string = "Hello World";
      const start: number = -5;
      const end: number = -2;
      const expectedResult: string = "Wor";

      // 2. Act
      const result: string = helpers.substr(testString, start, end);

      // 3. Assert
      expect(result).to.equal(expectedResult);
    });
  });

  describe("ucfirst()", () => {
    it("should return first letter in string uppercased", () => {
      // 1. Arrenge
      const testString: string = "hello world";
      const expectedResult: string = "Hello world";

      // 2. Act
      const result: string = helpers.ucFirst(testString);

      // 3. Assert
      expect(result).to.equal(expectedResult);
    });
  });

  describe("lcFirst()", () => {
    it("should return first letter in string lowercase", () => {
      // 1. Arrenge
      const testString: string = "Hello world";
      const expectedResult: string = "hello world";

      // 2. Act
      const result: string = helpers.lcFirst(testString);

      // 3. Assert
      expect(result).to.equal(expectedResult);
    });
  });

  describe("unique()", () => {
    it("Should remove duplicate values from array of strings", () => {
      // 1. Arrenge
      const testArray: string[] = ["foo", "bar", "hello", "world", "foo", "doo"];
      const expectedResult: string[] = ["foo", "bar", "hello", "world", "doo"];

      // 2. Act
      const result: string[] = helpers.unique(testArray);

      // 3. Assert
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
