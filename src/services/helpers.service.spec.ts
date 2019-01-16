import { expect } from "chai";
import { container } from "../modules/container.module";
import { HelperService } from "../services//helpers.service";
import * as fs from "fs";

const helpers: HelperService = container.getService(HelperService);

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
      // 1. Arrange
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
      // 1. Arrange
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
      // 1. Arrange
      const testArray: string[] = ["foo", "bar", "hello", "world", "foo", "doo"];
      const expectedResult: string[] = ["foo", "bar", "hello", "world", "doo"];

      // 2. Act
      const result: string[] = helpers.unique(testArray);

      // 3. Assert
      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe("dotAnnotaion()", () => {
    it("Should be able to mine value from object using dot annotation as a string", () => {
      // 1. Arrange
      const testObject = { foo: { bar: { hello: "world" } } };
      const testAnnotation = "foo.bar.hello";

      // 2. Act
      const result = helpers.dotAnnotaion(testObject, testAnnotation);

      // 3. Assert
      expect(result).to.equal("world");
    });

    it("Should return \"undefined\" if annotation fails", () => {
      // 1. Arrange
      const testObject = { foo: { bar: { hello: "world" } } };
      const testAnnotation = "foo.bar.hello.world";

      // 2. Act
      const result = helpers.dotAnnotaion(testObject, testAnnotation);

      // 3. Assert
      expect(result).to.equal(undefined);
    });

    it("Should be able to update object to provided value at annotation", () => {
      // 1. Arrange
      const testObject = { foo: { bar: { hello: "world" } } };
      const testAnnotation = "foo.bar.hello";
      const updateTo = "Updated Value";

      // 2. Act
      const result = helpers.dotAnnotaion(testObject, testAnnotation, updateTo);

      // 3. Assert
      expect(testObject.foo.bar.hello).to.equal(updateTo);
    });
  });

  describe("readFileByLine()", () => {
    it("Should be able to execute callback for each line in a file", (done) => {
      // 1. Arrange
      const filePath = `/tmp/${Math.round(Math.random() * Math.pow(10, 10))}`;
      const lines = ['A', 'B', 'C'];
      fs.writeFileSync(filePath, lines.join("\n"), "utf-8");

      // 2. Act
      helpers.readFileByLine(filePath, (line: string, index: number) => {
        // 3. Assert
        expect(line).to.equal(lines[index]);
      }).then(() => {
        fs.unlinkSync(filePath);
        done();
      });
    })
  });

  describe("fileFirstLine", () => {
    it("Should get the first line of file", (done) => {
      // 1. Arrange
      const filePath = `/tmp/${Math.round(Math.random() * Math.pow(10, 10))}`;
      const lines = ['A', 'B', 'C'];
      fs.writeFileSync(filePath, lines.join("\n"), "utf-8");

      // 2. Act
      helpers.fileFirstLine(filePath).then((firstLine: string) => {
        // 3. Assert
        expect(firstLine).to.equal(lines[0]);
        fs.unlinkSync(filePath);
        done();
      });
    });
  });

  describe("prependLineToFile", () => {
    it("should be able to prepend line to file", (done) => {
      // 1. Arrange
      const filePath = `/tmp/${Math.round(Math.random() * Math.pow(10, 10))}`;
      const lines = ['A', 'B', 'C'];
      const newLine = "0";
      fs.writeFileSync(filePath, lines.join("\n"), "utf-8");

      // 2. Act
      helpers.prependLineToFile(filePath, newLine).then(() => {
        const firstRow = fs.readFileSync(filePath, "utf-8").split("\n")[0];
        expect(firstRow).to.equal(newLine);
        fs.unlinkSync(filePath);
        done();
      });
    });
  });
});
