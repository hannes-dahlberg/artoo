import { ORM, Models } from '../';

export default class Group extends ORM.Model {
  public users() { return this.belongsToMany(Models.User, 'users_to_groups', 'group_id', 'user_id'); }
}