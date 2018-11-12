import { Singleton } from './singleton';
import * as helpers from './helpers';

type reference<T, I extends new(...args: any[]) => T> = {
  name: string,
  classInstance: I,
  objectInstance: T | null
}

class Container extends Singleton {
  private references: reference<any, any>[] = [];

  public create<T, I extends new(...args: any[]) => T>(instance: I | string, ...args: any[]): T {
    instance = this.getClassInstance(instance);

    try {
      return new(instance)(args);
    } catch(error) { throw new Error('Instance is not newable'); }
  }

  public set<T, I extends new(...args: any[]) => T>(instance: I, name?: string): I {
    name = name != undefined ? name : instance.name;
    let referenceIndex: number = this.references.findIndex((reference: reference<T, I>) => reference.name == name);
    let reference: reference<T, I> = { name, classInstance: instance, objectInstance: null};

    if(referenceIndex == -1) {
      this.references.push(reference);
    } else {
      this.references[referenceIndex] = reference
    }

    return reference.classInstance;
  }

  public get<T, I extends new(...args: any[]) => T>(instance: I | string): T {
    let name: string = typeof instance == 'string' ? instance : instance.name;


    let reference: reference<T, I> = this.references.find((reference: reference<T, I>) => reference.name == name);
    if(reference != undefined) {
      if(reference.objectInstance === null) {
        reference.objectInstance = new(reference.classInstance)();
      }
      return reference.objectInstance;
    }

    throw new Error('Reference could not be found');
  }

  public getClassInstance<T, I extends new(...args: any[]) => T>(instance: I | string): I {
    let name: string = typeof instance == 'string' ? instance : instance.name;
    let reference: reference<T, I> = this.references.find((reference: reference<T, I>) => reference.name == name);
    if(reference != undefined) { return reference.classInstance; }

    throw new Error('Reference could not be found');
  }
}

export let container = Container.getInstance<Container>();

export const injector = (name?: string) => (instance: any) => {
  container.set(instance, name);
};

export const service = injector;