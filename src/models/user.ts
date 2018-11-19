import { Model } from '../modules/orm/model';
import Group from './group';
import Claim from './claim';

import { Relation, type as relationType } from '../modules/orm/relation';
import { instance as storage, entity } from '../modules/storage';

export default class User extends Model {
  public password: string;

  public groups(): Relation<Group> | relationType { return this.belongsToMany<Group>(Group, 'users_to_groups', 'user_id', 'group_id'); }
  public claims(): Relation<Claim> | relationType { return this.belongsToMany<Claim>(Claim, 'users_to_claims', 'claim_id', 'user_id'); }
  public static getByEmail(email: string): Promise<User> {
    return new Promise((resolve, reject) => {
      this.where<User>('email', email).first()
      .then((user: User) => user)
      .catch((error: any) => reject(error));
    });
  }
}