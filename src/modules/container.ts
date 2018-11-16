import { Singleton } from './singleton';

type ConstructorParametersType<T extends new (...args: any[]) => any> = T extends new (...args: infer P) => any ? P : never;
//export type classType<T, C extends new(...args: any[]) => T> = new(...args: ConstructorParametersType<C>) => T;
export type classType<T, C extends new (...args: any[]) => any> = new(...args: ConstructorParametersType<C>) => T
class Apa {
  constructor(a: number, b: string) {}
}

type reference<T, C extends new (...args: any[]) => any> = {
  name: string,
  instance: classType<T, C> | any,
  object?: T
}

class Container extends Singleton {
  private references: reference<any,any>[] = [];
  
  public create<T, C extends new (...args: any[]) => any>(name: string | classType<T, C>, args?: ConstructorParametersType<C>): T {
    let reference: reference<T, C>;
    if(typeof name !== 'string') {
      reference = this.getReference<T, C>(name.name);
      if(reference === undefined) {
        this.set<T, C>(name.name, name);
      }

      return this.create<T, C>(name.name, args);
    } else {
      reference = this.getReference<T, C>(name);
    }

    if(reference === undefined) {
      throw new Error('Reference could not be found');
    }
    return new (<classType<T, C>>reference.instance)(...args);
  }

  public get<T>(name: string): T
  public get<T, C extends new (...args: any[]) => any>(name: string | classType<T, C>): T | C {
    if(typeof name !== 'string') {
      try {
        name = name.name;
      } catch(e) { throw new Error('Could not get name reference'); }
    }
    return this.getReference<T, C>(name).instance;
  }
  public getService<T, C extends new (...args: any[]) => any>(name: string | classType<T, C>, args?: ConstructorParametersType<C>): T {
    let reference: reference<T, C> = this.getReference<T, C>(typeof name !== 'string' ? name.name : name);
    if(typeof name !== 'string' && reference === undefined) {
        this.set<T, C>(name.name, name);
        return this.getService<T, C>(name.name, args);
    }

    if(reference.object === undefined) {
      reference.object = this.create(name, args);
    } else {
    }

    return reference.object;
  }

  public set<T, C extends new (...args: any[]) => any>(name: string, instance: classType<T, C> | any): T {
    let newReference: reference<T, C> = {
      name,
      instance
    };

    let reference = this.getReference<T, C>(name);
    if(reference === undefined) {
      
      this.references.push(newReference);
    } else {
      reference = newReference;
    }

    return newReference.instance;
  }

  private getReference<T, C extends new (...args: any[]) => any>(name: string): reference<T, C> {
    return <reference<T, C>>this.references.find((reference: reference<T, C>) => reference.name == name);
  }
}

export const container = Container.getInstance<Container>();