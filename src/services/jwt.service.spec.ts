import { expect } from "chai";
import { container } from "../modules/container.module";
import { JWTService } from "./jwt.service";

const jwtService: JWTService = container.getService(JWTService);

describe("Services", () => {
  describe("JWT", () => {
    it("Should be able to create token", () => {
      // 1. Arrange
      const key = "EBdVaKyseI";
      const object = { userId: 1 };

      // 2. Act
      const token = jwtService.sign(object, { key });

      // 3. Assert
      expect(token).to.not.be.empty;
    });

    it("should be able to decode token", () => {
      // 1. Arrange
      const key = "EBdVaKyseI";
      const object = { userId: 1 };
      const token = jwtService.sign(object, { key });

      // 2. Act
      const decodedObject = jwtService.decode(token, key);

      // 3. Assert
      expect(decodedObject).to.deep.equal(object);
    });
  });
});
