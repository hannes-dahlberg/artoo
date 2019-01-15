import { UserModel as ArtosUserModel } from "artos";
import { GroupModel } from "./group.model";


export class UserModel extends ArtosUserModel {
  public static table = "users";
  public static fields = ["id", "email", "password"];
  public static fillable = ["email", "password"];

  public email: string;
  public password: string;
  public _groups: GroupModel[] = [];
  public groups() { return this.belongsToMany<GroupModel>(GroupModel, "users_to_groups", "user_id", "group_id"); }
}