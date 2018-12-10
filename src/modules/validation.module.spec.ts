import { expect } from "chai";
import { validate, Validation } from "./validation.module";

describe("validation", () => {
  describe("validate()", () => {
    it("Should be able to apply simple validation", () => {
      // 1. Arrange
      const value = "hello world";

      // 2. Act
      const result = validate(value, Validation.required);

      // 3. Assert
      expect(result).to.equal(true);
    });

    it("Should be able to apply multiple validations to a single value", () => {
      // 1. Arrange
      const value = "hello world";

      // 2. Act
      const result = validate(value, [Validation.required, Validation.min(3)]);

      // 3. Assert
      expect(result).to.equal(true);
    });

    it("Should be able to apply multiple validation mapped to multiple values", () => {
      // 1. Arrange
      const value = { foo: "hello world", bar: "23" };
      const validation = { foo: Validation.required, bar: [Validation.required, Validation.between(20, 25)] };

      // 2. Act
      const result = validate(value, validation);

      // 3. Assert
      expect(result).to.equal(true);
    });

    it("Should be able to fail validation", () => {
      // 1. Arrange
      const value = { foo: "hello world", bar: "32" };
      const validation = { foo: Validation.required, bar: [Validation.required, Validation.between(20, 25)] };

      // 2. Act
      const result = validate(value, validation);

      // 3. Assert
      expect(result).to.equal(false);
    });
  });
});
