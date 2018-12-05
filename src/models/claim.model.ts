import { GroupModel, UserModel } from ".";
import { IRelationType, ModelModule, RelationModule } from "../modules/orm";

export class ClaimModel extends ModelModule {
  public static table = "claims";
  public static fields = ["name"];
  public static fillable = ["name"];

  public id: number;

  public users(): RelationModule<UserModel> | IRelationType { return this.belongsToMany<UserModel>(UserModel, "users_to_claims", "claim_id", "user_id"); }
  public groups(): RelationModule<GroupModel> | IRelationType { return this.belongsToMany<GroupModel>(GroupModel, "groups_to_claims", "claim_id", "group_id"); }
}
