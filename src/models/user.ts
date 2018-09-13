import { ORM, Models } from '../';

export default class User extends ORM.Model {
  public groups() { return this.belongsToMany<Models.Group>(Models.Group, 'users_to_groups', 'user_id', 'group_id'); }
}