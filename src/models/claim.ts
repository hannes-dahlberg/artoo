import { Model } from '../modules/orm/model';
import User from './user';
import Group from './group';

import { Relation, type as relationType } from '../modules/orm/relation';

export default class Claim extends Model {
  public users(): Relation<User> | relationType { return this.belongsToMany<User>(User, 'users_to_claims', 'claim_id', 'user_id'); }
  public groups(): Relation<Group> | relationType { return this.belongsToMany<Group>(Group, 'groups_to_claims', 'claim_id', 'group_id'); }
}