import { container } from '../modules/container';
import { JWT, jwt } from './jwt';
import { Hash, hash } from './hash';
import User from '../models/user';

export class Auth {
  public constructor(
    private readonly userModel: typeof User = container.get('model.user', User),
    private readonly jwt: JWT = container.getService(JWT, { useName: 'service.jwt' }),
    private readonly hash: Hash = container.getService(Hash, { useName: 'service.hash' })
  ) {
    this.userModel;
  }

  public attempt(username: string, password: string): Promise<{ user: User, token: string }> {
    return new Promise((resolve, reject) => {
      this.userModel.getByEmail(username).then((user: User) => {
        if(this.hash.check(password, user.password)) {
          resolve({
            user: user,
            token: jwt.sign({ userId: user.id })
          })
        }
      }).catch((error: any) => reject(error));
    });
  }
  public check(token: string): Promise<User> {
    return new Promise((resolve, reject) => {
      let decodedToken = <{ userId: string}>this.jwt.decode(token);
      if(decodedToken.userId) {
        User.find(parseInt(decodedToken.userId)).then((user: User) => {
          if(user) { resolve(user); return; }
          reject(new Error('Token invalid. User not found'));
        });
      }
      reject(new Error('Token invalid'));
    });
  }
}

export let auth: Auth = container.getService(Auth, { useName: 'service.auth' });