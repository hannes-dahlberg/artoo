import { Model } from '../modules/orm/model';
import { User } from './user';
import { Claim } from './claim';

import { Relation, type as relationType } from '../modules/orm/relation';

export class Group extends Model {
  public static table = 'groups';
  public static fields = ['id', 'name'];
  public static fillable = ['name'];

  public users(): Relation<User> | relationType { return this.belongsToMany<User>(User, 'users_to_groups', 'group_id', 'user_id'); }
  public claims(): Relation<Claim> | relationType { return this.belongsToMany<Claim>(Claim, 'group_to_claims', 'claim_id', 'group_id'); }
}