import { Model } from '../modules/orm/model';
import User from './user';

export default class Group extends Model {
  public users() { return this.belongsToMany<User>(User, 'users_to_groups', 'group_id', 'user_id'); }
}