import { GroupModel as ArtosGroupModel } from "artos";
import { UserModel } from "./user.model";

export class GroupModel extends ArtosGroupModel {
  public static table = "groups";
  public static fields = ["id", "name"];
  public static fillable = ["name"];
  public _users: UserModel[] = [];

  public users() { return this.belongsToMany<UserModel>(UserModel, "users_to_groups", "group_id", "user_id"); }
}
