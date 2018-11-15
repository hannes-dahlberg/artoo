import { Singleton } from './singleton';

export type classType<T, C extends new(...args: ConstructorParameters<C>) => T> = new(...args: ConstructorParameters<C>) => T;

class Apa {
  constructor(a: number, b: string) {}
}

type reference<T, C extends classType<T, C>> = {
  name: string,
  instance: classType<T, C> | any,
  object?: T
}

class Container extends Singleton {
  private references: reference<any,any>[] = [];
  
  public create<T, C extends classType<T, C>>(name: string | classType<T, C>, args?: ConstructorParameters<C>): T {
    if(typeof name !== 'string') {
      try {
        name = name.name;
      } catch(e) { throw new Error('Could not get name reference'); }
    }
    
    let reference = this.getReference<T, C>(name);
    
    try {
      return new (<classType<T, C>>reference.instance)(...args);
    } catch(error) { throw new Error('reference not newable'); }
  }

  public get<T>(name: string): T
  public get<T, C extends classType<T, C>>(name: string | classType<T, C>): T | C {
    if(typeof name !== 'string') {
      try {
        name = name.name;
      } catch(e) { throw new Error('Could not get name reference'); }
    }
    return this.getReference<T, C>(name).instance;
  }
  public getService<T, C extends classType<T, C>>(name: string | classType<T, C>, args?: ConstructorParameters<C>): T {
    if(typeof name !== 'string') {
      try {
        let reference = this.getReference<T, C>(name.name);
        if(reference === undefined) {
          this.set(name.name, name);
          
          return this.getService<T, C>(name.name, args);
        }
      } catch(e) { throw new Error('Could not get service'); }
    } else {
        let reference = this.getReference<T, C>(name);
        if(reference.object === undefined) {
          reference.object = this.create(name, args);
        }
    
        return reference.object;
      }
  }

  public set<T, C extends classType<T, C>>(name: string, instance: classType<T, C> | any): T {
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

  private getReference<T, C extends classType<T, C>>(name: string): reference<T, C> {
    let a = this.references.find((reference: reference<T, C>) => reference.name == name);
    return <reference<T, C>>a;
  }
}

export const container = Container.getInstance<Container>();