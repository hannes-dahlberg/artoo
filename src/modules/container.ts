import { Singleton } from './singleton';
import * as helpers from './helpers';

type reference = {
  name: string,
  instance: any,
  object?: any
}

class Container extends Singleton {
  private references: reference[] = [];
  
  public create<T>(name: string, args: any[] = []): T {
    let reference = this.getReference(name);
    
    try {
      return new (reference.object)(args);
    } catch(error) { throw new Error('reference not newable'); }
  }
  public get<T>(name: string): T {
    return this.getReference(name).instance;
  }
  public getService<T>(name: string): T {
    let reference = this.getReference(name);
    if(reference.object === undefined) {
      reference.object = this.create(name);
    }

    return reference.object;
  }

  public set<T>(name: string, instance: any): T {
    let newReference: reference = {
      name,
      instance
    };

    let reference = this.getReference(name);
    if(reference === undefined) {
      this.references.push(newReference);
    } else {
      reference = newReference;
    }

    return newReference.instance;
  }

  private getReference(name: string): reference {
    return this.references.find((reference: reference) => reference.name == name);
  }
}

export const container = Container.getInstance<Container>();

/*type reference<T, I extends new(...args: any[]) => T> = {
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

export const service = injector;*/