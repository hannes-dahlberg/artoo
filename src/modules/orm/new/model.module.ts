import { container } from "../../container.module";
import { StorageService } from "../../../services";
import { StatementModule } from "./statement.module";

const storageService: StorageService = container.getService(StorageService);

export class ModelModule {
  private readyStatement: StatementModule;

  public static readonly entityName: string | null = null;
  public static readonly table: string | null = null;
  public static readonly fields: string[] = ["id"];
  public static readonly fillable: string[] = [];
  public static readonly hidden: string[] = [];

  // Representation of the current class instance
  public get self(): typeof ModelModule { return (<typeof ModelModule>this.constructor); }

  // Uses the class name itself if no name is set
  public get entityName(): string { return this.self.entityName || this.self.name; }

  // Uses the class name itself as plural if no table name i set
  public get table(): string { return this.self.table || `${this.self.name}s`; }
  public get fields(): string[] { return this.self.fields; }
  public get fillable(): string[] { return this.self.fillable; }
  public get hidden(): string[] { return this.self.hidden; }

  /*protected hasOne<T>(model: typeof ModelModule)
  protected hasOne<T>(model: typeof ModelModule, key: string)
  protected hasOne<T extends ModelModule>(model: typeof ModelModule, { key, primaryKey }: { key?: string, primaryKey?: string } = {}): T {
    key = this.relationKey(key);
    primaryKey = this.relationPrimaryKey(primaryKey);

  }*/
  protected hasMany(model: typeof ModelModule, { key, primaryKey }: { key?: string, primaryKey?: string } = {}) {
    key = this.relationKey(key);
    primaryKey = this.relationPrimaryKey(primaryKey);
  }
  protected belongsTo(model: typeof ModelModule, key: string, primaryKey: string = 'id') {

  }
  protected belongsToMany(model: typeof ModelModule, key?: string, otherKey?: string, pivotTable?: string) {

  }

  private relationKey(key?: string): string {
    return key || `${this.entityName}_id`;
  }
  private relationPrimaryKey(primaryKey?: string) {
    return primaryKey || "id";
  }
  private relationOtherKey(model: typeof ModelModule, otherKey?: string) {
    return otherKey || `${model.entityName}_id`;
  }
  private relationPivotTable(model: typeof ModelModule, pivotTable?: string) {
    return pivotTable || `${this.table}_to_${model.table}`;
  }
}