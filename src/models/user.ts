import { Model } from '../modules/orm/model';
import Group from './group';

export default class User extends Model {
  public groups() { return this.belongsToMany<Group>(Group, 'users_to_groups', 'user_id', 'group_id'); }
}