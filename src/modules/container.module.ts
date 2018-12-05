import { ConstructorParametersType } from "../services/helpers.service";
import { SingletonModule } from "./singleton.module";

export type classType<T, C extends new (...args: any[]) => T> = new (...args: ConstructorParametersType<C>) => T;

interface IReference<T, C extends new (...args: any[]) => T> {
  name: string;
  instance: C | T;
  object?: T;
}

class Container extends SingletonModule {
  private references: Array<IReference<any, any>> = [];

  public create<T, C extends new (...args: any[]) => T>(name: string | C, args?: ConstructorParametersType<C>): T {
    let reference: IReference<T, C>;
    if (typeof name !== "string") {
      reference = this.getReference<T, C>(name.name);
      if (reference === undefined) {
        this.setInternal(name.name, name);
      }

      return this.create<T, C>(name.name, args);
    } else {
      reference = this.getReference<T, C>(name);
    }

    if (reference === undefined) {
      throw new Error("Reference could not be found");
    }

    return new (reference.instance as C)(...args);
  }

  public get<T, C extends new (...args: any[]) => T>(name: string, instance: C): C;
  public get<T>(name: string | T): T;
  public get<T>(name: string, instance: T): T;
  public get<T, C extends new (...args: any[]) => T>(name: string | C, instance?: C | T): C | T {
    if (typeof name === "function" && name.name !== undefined) {
      const r = this.getReference<T, C>(name.name);
      if (r === undefined) {
        return this.setInternal(name.name, name);
      } else {
        return r.instance;
      }
    } else if (typeof name === "string" && instance !== undefined) {
      return this.setInternal(name, instance);
    } else if (typeof name !== "string") {
      throw new Error("Reference is missing name attribute to be created automatically. Please use get(name: string, instance: any)");
    }

    const reference = this.getReference<T, C>(name);
    if (reference === undefined) { throw new Error("Reference was not found. Create it by providing an instance the same time you get it. eg. get(name: string, instance: any"); }

    return reference.instance;
  }
  public getService<T, C extends new (...args: any[]) => T>(name: string | C, { args, useName }: { args?: ConstructorParametersType<C>, useName?: string } = {}): T {
    const reference: IReference<T, C> = this.getReference<T, C>(typeof name !== "string" ? name.name : name);
    if (typeof name !== "string" && reference === undefined) {
      useName = useName || name.name;
      this.setInternal(useName, name);
      return this.getService<T, C>(useName, { args });
    }

    if (reference.object === undefined) {
      reference.object = this.create(name, args);
    }

    return reference.object;
  }
  public set<C>(name: string, instance: C, override: boolean = false): C {
    const reference = this.getReference(name);
    if (reference !== undefined && ["test", "production"].indexOf(process.env.NODE_ENV) === -1) {
      if (override) {
        console.warn(`REFERENCE "${name}" IS OVERWRITTEN, BE WARNED`);
      } else {
        console.warn(`REFERENCE "${name}" HAS ALREADY BEEN SET, INSTANCE MAY NOT BE WHAT YOU'RE EXPECTED`);
      }
    }
    return this.setInternal<C>(name, instance, override);
  }
  private setInternal<C>(name: string, instance: C, override: boolean = false): C {
    const newReference: IReference<any, any> = {
      instance,
      name,
    };

    let reference = this.getReference(name);
    if (reference === undefined) {
      this.references.push(newReference);
      reference = newReference;
    } else if (override) {
      reference = this.setReference(newReference);
    }
    return reference.instance as C;
  }

  private getReference<T, C extends new (...args: any[]) => T>(name: string): IReference<T, C> {
    return this.references.find((reference: IReference<T, C>) => reference.name === name) as IReference<T, C>;
  }
  private getReferenceIndex<T, C extends new (...args: any[]) => T>(name: string): number {
    return this.references.findIndex((reference: IReference<T, C>) => reference.name === name);
  }
  private setReference<T, C extends new (...args: any[]) => T>(reference: IReference<T, C>, index?: number): IReference<T, C> {
    if (index === undefined) {
      index = this.getReferenceIndex(reference.name);
    }
    return this.references[index] = reference;
  }
}

export const container = Container.getInstance<Container>();
