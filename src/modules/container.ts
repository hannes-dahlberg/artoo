import { ConstructorParametersType } from "./helpers";
import { Singleton } from "./singleton";

export type classType<T, C extends new (...args: any[]) => T> = new (...args: ConstructorParametersType<C>) => T;

interface reference<T, C extends new (...args: any[]) => T> {
  name: string;
  instance: C | T;
  object?: T;
}

class Container extends Singleton {
  private references: Array<reference<any, any>> = [];

  public create<T, C extends new (...args: any[]) => T>(name: string | C, args?: ConstructorParametersType<C>): T {
    let reference: reference<T, C>;
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
      const reference = this.getReference<T, C>(name.name);
      if (reference === undefined) {
        return this.setInternal(name.name, name);
      } else {
        return reference.instance;
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
    const reference: reference<T, C> = this.getReference<T, C>(typeof name !== "string" ? name.name : name);
    if (typeof name !== "string" && reference === undefined) {
      useName = useName || name.name;
      this.setInternal(useName, name);
      return this.getService<T, C>(useName, { args });
    }

    if (reference.object === undefined) {
      reference.object = this.create(name, args);
    } else {
    }

    return reference.object;
  }
  public set<C>(name: string, instance: C, override: boolean = false): C {
    const reference = this.getReference(name);
    if (reference !== undefined && ["test", "production"].indexOf(process.env.NODE_ENV) == -1) {
      if (override) {
        console.warn(`REFERENCE "${name}" IS OVERWRITTEN, BE WARNED`);
      } else {
        console.warn(`REFERENCE "${name}" HAS ALREADY BEEN SET, INSTANCE MAY NOT BE WHAT YOU'RE EXPECTED`);
      }
    }
    return this.setInternal<C>(name, instance, override);
  }
  private setInternal<C>(name: string, instance: C, override: boolean = false): C {
    const newReference: reference<any, any> = {
      name,
      instance,
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

  private getReference<T, C extends new (...args: any[]) => T>(name: string): reference<T, C> {
    return this.references.find((reference: reference<T, C>) => reference.name === name) as reference<T, C>;
  }
  private getReferenceIndex<T, C extends new (...args: any[]) => T>(name: string): number {
    return this.references.findIndex((reference: reference<T, C>) => reference.name === name);
  }
  private setReference<T, C extends new (...args: any[]) => T>(reference: reference<T, C>, index?: number): reference<T, C> {
    if (index === undefined) {
      index = this.getReferenceIndex(reference.name);
    }
    return this.references[index] = reference;
  }
}

export const container = Container.getInstance<Container>();
