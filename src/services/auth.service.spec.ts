import { expect } from "chai";
import { container } from "../modules/container.module";
import { AuthService } from "./auth.service";
import { HashService } from "./hash.service";

const hashService: HashService = container.getService(HashService, { useName: "service.hash" });

class FakeUser {
  public static getByEmail(email: string): Promise<FakeUser> { return new Promise<FakeUser>((resolve, reject) => resolve(new FakeUser(email))); }
  public static find(id: number): Promise<FakeUser> { return new Promise<FakeUser>((resolve, reject) => resolve(new FakeUser("test@test.test"))); }
  public constructor(public email: string, public password: string = hashService.create("test"), public id: number = 1) { }
}

container.set("model.user", FakeUser, true);
const authService: AuthService = container.getService(AuthService);

describe("Services", () => {
  describe("Auth", () => {
    describe("attempt()", () => {
      it("Should be able to create token", (done) => {
        // 1. Arrange
        const email = "test@test.test";
        const password = "test";

        // 2. Act
        authService.attempt(email, password).then((data: any) => {
          // 3. Assert
          expect(data.token).to.not.empty;
          done();
        });
      });
    });

    describe("check()", () => {
      it("Should be able to check that a token is valid", (done) => {
        // 1. Arrange
        const email = "test@test.test";
        const password = "test";

        // 2. Act
        authService.attempt(email, password).then((data: any) => {
          authService.check(data.token).then((user: any) => {
            // 3. Assert
            expect(user.id).to.equal(1);
            done();
          }).catch((error: any) => console.log(error));
        });
      });
    });
  });
});
