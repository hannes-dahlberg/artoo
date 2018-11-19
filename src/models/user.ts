import { Model } from '../modules/orm/model';
import { Hash, hash } from '../services/hash';
import { container } from '../modules/container';
import Group from './group';
import Claim from './claim';

import { Relation, type as relationType } from '../modules/orm/relation';

export default class User extends Model {
  public static table = 'users';
  public static fields = ['id', 'email', 'password'];
  public static fillable = ['email', 'password'];
  public static hidden = ['password'];

  public password: string;
  
  public groups(): Relation<Group> | relationType { return this.belongsToMany<Group>(Group, 'users_to_groups', 'user_id', 'group_id'); }
  public claims(): Relation<Claim> | relationType { return this.belongsToMany<Claim>(Claim, 'users_to_claims', 'claim_id', 'user_id'); }
  
  public static create<T extends Model>(data: any): Promise<T> {
    if(data.password) {
      data.password = container.getService<Hash, typeof Hash>(Hash, { useName: 'services.hash' }).create(data.password);
    }

    return super.create<T>(data);
  }

  public static getByEmail(email: string): Promise<User> {
    return new Promise((resolve, reject) => {
      this.where<User>('email', email).first()
      .then((user: User) => resolve(user))
      .catch((error: any) => reject(error));
    });
  }
}