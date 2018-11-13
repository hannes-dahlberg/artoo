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