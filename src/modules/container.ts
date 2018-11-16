import { Singleton } from './singleton';
import { ConstructorParametersType } from './helpers';

export type classType<T, C extends new (...args: any[]) => T> = new(...args: ConstructorParametersType<C>) => T

type reference<T, C extends new (...args: any[]) => T> = {
  name: string,
  instance: C | T,
  object?: T
}

class Container extends Singleton {
  private references: reference<any,any>[] = [];
  
  public create<T, C extends new (...args: any[]) => T>(name: string | C, args?: ConstructorParametersType<C>): T {
    let reference: reference<T, C>;
    if(typeof name !== 'string') {
      reference = this.getReference<T, C>(name.name);
      if(reference === undefined) {
        this.setInternal(name.name, name);
      }

      return this.create<T, C>(name.name, args);
    } else {
      reference = this.getReference<T, C>(name);
    }

    if(reference === undefined) {
      throw new Error('Reference could not be found');
    }
    
    return new (<C>reference.instance)(...args);
  }

  public get<T, C extends new (...args: any[]) => T>(name: string, instance: C): C;
  public get<T>(name: T): T;
  public get<T>(name: string, instance: T): T;
  public get<T, C extends new (...args: any[]) => T>(name: string | C, instance?: C | T): C | T {
    if(typeof name === 'function' && name.name !== undefined) {
      let reference = this.getReference<T, C>(name.name);
      if(reference === undefined) {
        return this.setInternal(name.name, name);
      } else {
        return reference.instance;
      }
    } else if(typeof name === 'string' && instance !== undefined) {
      return this.setInternal(name, instance);
    } else if(typeof name !== 'string') {
      throw new Error('Reference is missing name attribute to be created automatically. Please use get(name: string, instance: any)');
    }
    
    return this.getReference<T, C>(name).instance;
  }
  public getService<T, C extends new (...args: any[]) => T>(name: string | C, args?: ConstructorParametersType<C>): T {
    let reference: reference<T, C> = this.getReference<T, C>(typeof name !== 'string' ? name.name : name);
    if(typeof name !== 'string' && reference === undefined) {
        this.setInternal(name.name, name);
        return this.getService<T, C>(name.name, args);
    }

    if(reference.object === undefined) {
      reference.object = this.create(name, args);
    } else {
    }

    return reference.object;
  }
  public set<C>(name: string, instance: C): C {
    let reference = this.getReference(name);
    if(reference === undefined) {
      console.warn(`REFERENCE "${name}" HAS ALREADY BEEN SET, INSTANCE MAY NOT BE WHAT YOU'RE EXPECTED`);
    }
    return this.setInternal<C>(name, instance);
  }
  private setInternal<C>(name: string, instance: C): C {
    let newReference: reference<any,any> = {
      name,
      instance
    };

    let reference = this.getReference(name);
    if(reference === undefined) {
      this.references.push(newReference);
      reference = newReference;
    } else {
      //reference = newReference;
    }
    return <C>reference.instance;
  }

  private getReference<T, C extends new (...args: any[]) => T>(name: string): reference<T, C> {
    return <reference<T, C>>this.references.find((reference: reference<T, C>) => reference.name == name);
  }
}

export const container = Container.getInstance<Container>();