import { container } from "../modules";
import { IRelationType, ModelModule, RelationModule } from "../modules/orm";
import { HashService } from "../services";
import { ClaimModel } from "./claim.model";
import { GroupModel } from "./group.model";

export class UserModel extends ModelModule {
  public static table = "users";
  public static fields = ["id", "email", "password"];
  public static fillable = ["email", "password"];
  public static hidden = ["password"];

  public static create<T extends ModelModule>(data: any): Promise<T> {
    if (data.password) {
      data.password = container.getService<HashService, typeof HashService>(HashService, { useName: "services.hash" }).create(data.password);
    }

    return super.create<T>(data);
  }

  public static getByEmail(email: string): Promise<UserModel> {
    return new Promise((resolve, reject) => {
      this.where<UserModel>("email", email).first()
        .then((user: UserModel) => resolve(user))
        .catch((error: any) => reject(error));
    });
  }

  public id: number;

  public password: string;

  public groups(): RelationModule<GroupModel> | IRelationType { return this.belongsToMany<GroupModel>(GroupModel, "users_to_groups", "user_id", "group_id"); }
  public _groups: GroupModel[] = [];
  public claims(): RelationModule<ClaimModel> | IRelationType { return this.belongsToMany<ClaimModel>(ClaimModel, "users_to_claims", "claim_id", "user_id"); }
  public _claims: ClaimModel[] = [];
}
