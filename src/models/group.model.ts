import { ClaimModel, UserModel } from ".";
import { IRelationType, ModelModule, RelationModule } from "../modules/orm";

export class GroupModel extends ModelModule {
  public static table = "groups";
  public static fields = ["id", "name"];
  public static fillable = ["name"];

  public id: number;

  public users(): RelationModule<UserModel> | IRelationType { return this.belongsToMany<UserModel>(UserModel, "users_to_groups", "group_id", "user_id"); }
  public claims(): RelationModule<ClaimModel> | IRelationType { return this.belongsToMany<ClaimModel>(ClaimModel, "group_to_claims", "claim_id", "group_id"); }
}
