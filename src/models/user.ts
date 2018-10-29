import { Model } from '../modules/orm/model';
import Group from './group';

import { instance as storage, entity } from '../modules/storage';

export default class User extends Model {
  public groups() { return this.belongsToMany<Group>(Group, 'users_to_groups', 'user_id', 'group_id'); }

  public static getByEmail(email: string): Promise<entity> {
    return new Promise((resolve, reject) => {
      storage.db.get(`SELECT * FROM [${this.table}] WHERE [email] = '${email}'`, (error: Error, row: any) => {
      if(error) { console.log(error); reject(error); return; }
        resolve(row);
      });
    });
  }
}