import { User } from "../models/user";
import { container } from "../modules/container";
import { Hash } from "./hash";
import { JWT } from "./jwt";

export class Auth {
  public constructor(
    private readonly userModel: typeof User = container.get("model.user", User),
    private readonly jwt: JWT = container.getService(JWT, { useName: "service.jwt" }),
    private readonly hash: Hash = container.getService(Hash, { useName: "service.hash" }),
  ) { }

  public attempt(username: string, password: string): Promise<{ user: User, token: string }> {
    return new Promise((resolve, reject) => {
      this.userModel.getByEmail(username).then((user: User) => {
        if (this.hash.check(password, user.password)) {
          resolve({
            token: this.jwt.sign({ userId: user.id }),
            user,
          });
        }
      }).catch((error: any) => reject(error));
    });
  }
  public check(token: string): Promise<User> {
    return new Promise((resolve, reject) => {
      const decodedToken = this.jwt.decode(token) as { userId: string };
      if (decodedToken.userId) {
        User.find(parseInt(decodedToken.userId, 10)).then((user: User) => {
          if (user) { resolve(user); return; }
          reject(new Error("Token invalid. User not found"));
        });
      }
      reject(new Error("Token invalid"));
    });
  }
}

export let auth: Auth = container.getService(Auth, { useName: "service.auth" });
