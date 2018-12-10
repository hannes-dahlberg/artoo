import { UserModel } from "../models/user.model";
import { container } from "../modules/container.module";
import { HashService } from "../services/hash.service";
import { JWTService } from "../services/jwt.service";

export class AuthService {
  public constructor(
    private readonly hashService: HashService = container.getService(HashService, { useName: "service.hash" }),
    private readonly jwtService: JWTService = container.getService(JWTService, { useName: "service.jwt" }),
    private readonly userModel: typeof UserModel = container.get("model.user", UserModel),
  ) { }

  public attempt(username: string, password: string): Promise<{ user: UserModel, token: string }> {
    return new Promise((resolve, reject) => {
      this.userModel.getByEmail(username).then((user: UserModel) => {
        if (this.hashService.check(password, user.password)) {
          resolve({
            token: this.jwtService.sign({ userId: user.id }),
            user,
          });
        } else {
          reject(new Error("Auth attempt failed"));
        }
      }).catch((error: any) => reject(error));
    });
  }
  public check(token: string): Promise<UserModel> {
    return new Promise((resolve, reject) => {
      const decodedToken = this.jwtService.decode(token) as { userId: string };
      if (decodedToken.userId) {
        UserModel.find(parseInt(decodedToken.userId, 10)).then((user: UserModel) => {
          if (user) { resolve(user); return; }
          reject(new Error("Token invalid. User not found"));
        });
      }
      reject(new Error("Token invalid"));
    });
  }
}
