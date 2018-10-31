import { Model } from '../modules/orm/model';
import Group from './group';
import Claim from './claim';

import { Relation, type as relationType } from '../modules/orm/relation';
import { instance as storage, entity } from '../modules/storage';

export default class User extends Model {
  public groups(): Relation<Group> | relationType { return this.belongsToMany<Group>(Group, 'users_to_groups', 'user_id', 'group_id'); }
  public claims(): Relation<Claim> | relationType { return this.belongsToMany<Claim>(Claim, 'users_to_claims', 'claim_id', 'user_id'); }

  public static getByEmail(email: string): Promise<entity> {
    return new Promise((resolve, reject) => {
      storage.db.get(`SELECT * FROM [${this.table}] WHERE [email] = '${email}'`, (error: Error, row: any) => {
      if(error) { console.log(error); reject(error); return; }
        resolve(row);
      });
    });
  }
}