import { IRelationType, ModelModule, RelationModule } from "../modules/orm";
import { GroupModel } from "./group.model";
import { UserModel } from "./user.model";

export class ClaimModel extends ModelModule {
  public static table = "claims";
  public static fields = ["name"];
  public static fillable = ["name"];

  public id: number;

  public users(): RelationModule<UserModel> | IRelationType { return this.belongsToMany<UserModel>(UserModel, "users_to_claims", "claim_id", "user_id"); }
  public groups(): RelationModule<GroupModel> | IRelationType { return this.belongsToMany<GroupModel>(GroupModel, "groups_to_claims", "claim_id", "group_id"); }
}
