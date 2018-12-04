import { expect } from "chai";
import { container } from "../modules/container";
import { auth } from "./auth";

class FakeUser {
  public static getByEmail(email: string): FakeUser { return new FakeUser(email); }
  public constructor(public email: string, public password: string = "password", public id: number = 1) { }
}
container.set("model.user", FakeUser, true);

describe("Services", () => {
  describe("Auth", () => {
    it("Should be able to create token", (done) => {
      auth.attempt("user@test.com", "password").then((data: any) => {
        expect(data.token).to.empty;
        done();
      });
    });
  });
});
