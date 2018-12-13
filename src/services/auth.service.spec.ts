import { expect } from "chai";
import { container } from "../modules/container.module";
import { AuthService } from "./auth.service";
import { HashService } from "./hash.service";

const hashService: HashService = container.getService(HashService, { useName: "service.hash" });

class FakeUser {
  public static getByEmail(email: string): Promise<FakeUser> { return new Promise<FakeUser>((resolve, reject) => resolve(new FakeUser(email))); }
  public constructor(public email: string, public password: string = hashService.create("password"), public id: number = 1) { }
}

container.set("model.user", FakeUser, true);
const authService: AuthService = container.getService(AuthService);

describe("Services", () => {
  describe("Auth", () => {
    it("Should be able to create token", (done) => {
      authService.attempt("user@test.com", "password").then((data: any) => {
        expect(data.token).to.not.empty;
        done();
      });
    });
  });
});
