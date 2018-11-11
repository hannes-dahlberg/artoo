import { Singleton } from './singleton';
import * as helpers from './helpers';

type reference<T extends { name: string }> = {
  instance: instanceType<T>,
  name: string,
  args?: any[]
}

type instanceType<T extends { name: string}> = T | object | string;
type refererenceOptions = {
  name?: string,
  args?: any[]
}

export class Container extends Singleton {
  private references: reference<any>[] = [];

  //Create a new object of a reference or add reference if not existing
  public create<T extends { name: string }>(instance: string, options: refererenceOptions) : T {
    let reference: reference<T> | false = this.getReference(this.getName(instance, options));
    if(reference == false) { throw new Error('Reference could not be found'); }
    
    try {
      return new (<any>reference.instance)();
    } catch (error) {
      throw new Error('Instance is not newable');
    }
  }

  //Return a reference either as singleton, static class or object. If not existing it will be created
  public get<T extends { name: string }>(instance: instanceType<T>, options: refererenceOptions): T {
    let name = this.getName(instance, options);
    let reference: reference<T> | false = this.getReference(this.getName(instance, options));
    if(reference === false && typeof instance == 'function') {
      reference = {
        name,
        instance,
        ...({ args: options.args })
      }
    }
  }

  //Sets reference
  public set<T>(instance: T, options: refererenceOptions) {
    //this.references = 
  }

  private getName<T extends { name: string }>(instance: instanceType<T>, options: refererenceOptions): string {
    /*Determine name of passed instance. Either the name itself is passed as the instance
    parameter, the instance is a type with property "name" or name is passed in options*/
    if(typeof instance == 'function' && !options.name) { instance.name }
    else if(options.name) { return options.name; }
    else if(typeof instance == 'string') { return instance; }
    else { throw new Error('Instance name could not be determined'); }
  }
  private getReference(name: string): reference | false {
    let referenceIndex: number = this.references.findIndex((reference: reference) => reference.name == name);
    
    return referenceIndex != -1 ? this.references[referenceIndex] : false;
  }
}

export let container = Container.getInstance<Container>();

class Foo {

}

container.create<Foo>('Foo', {});
/*
export type container = {
  type: containerType,
  instance: any,
  object?: any,
  passArguments?: any[]
}

//Container type for factory
export enum containerType {
  SINGLETON = 'singleton',
  MODEL = 'model',
  OBJECT = 'object',
  STATIC = 'static'
}

export class Factory {
  //Holder of containers
  private static container: { [key:string]: container } = {};
  
  public static registerSingleton<T>(name: string, instance: { new(...args: any[]): T }, passArguments?: any[]) {
    this.set(name, containerType.SINGLETON, instance, passArguments);
  }
  public static registerModel<T>(name: string, instance: { new(...args: any[]): T }): void {
    this.set(name, containerType.MODEL, instance);
  }
  public static registerObject<T>(name: string, object: T): void {
    this.set(name, containerType.OBJECT, object);
  }
  public static registerStatic<T>(name: string, instance: { new(...args: any[]): T }): void {
    this.set(name, containerType.STATIC, instance);
  }
  public static set(name: string, type: containerType, instance: any, passArguments: any[] = []): container {
    if(!this.container[name]) { return this.container[name] = { type, instance, passArguments }; }
  }

  public static singleton(name: string, passArguments?: any[]): any {
    return this.get(name, { type: containerType.SINGLETON }).object;
  }
  public static model(name: string, passArguments: any[] = []): any {
    return (new (this.get(name, { type: containerType.MODEL })).object(...passArguments));
  }
  public static object(name: string, defaultObject?: any): any {
    return this.get(name, { type: containerType.OBJECT }).instance;
  }
  public static static(name: string): any {
    return this.get(name, { type: containerType.STATIC }).instance;
  }
  public static get(name: string, {
    type,
    passArguments
  }: {
    type?: containerType,
    passArguments?: any[];
  } = {}): container {
    if(this.container[name] && (type == null || this.container[name].type == type)) {
      //Create singleton if not already existing
      if(this.container[name].type == containerType.SINGLETON && this.container[name].object === undefined) {
        this.container[name].object = new this.container[name].instance(...(passArguments || this.container[name].passArguments));
      }
      return this.container[name];
  }

    throw new Error('Injectable could not be found');
  }
  }

export const injector = (type: containerType = containerType.SINGLETON, {
  name,
  passArguments = []
}: {
  name?: string,
  passArguments?: any[]
} = {}) => (instance: any) => {
  //Set name to instance name if not provided
  if(name === undefined) { name = helpers.lcFirst(instance.name); }
  if(type == containerType.SINGLETON) {
    Factory.registerSingleton(name, instance, passArguments);
  } else if(type == containerType.MODEL) {
    Factory.registerModel(name, instance)
  } else if(type == containerType.STATIC) {
    Factory.registerStatic(name, instance);
  }
};
type injectType = { name?: string, type?: containerType, passArguments?: any[], instance?: any }

export const inject = (args: string | injectType) => (apa: Function) => {
  let type = typeof args != 'string' ? args.type : undefined;
  let passArguments = typeof args != 'string' ? args.passArguments : undefined;
  let instance = typeof args != 'string' ? args.instance : undefined;
  let name: string = typeof args != 'string' ? args.name : args;

  if(type != undefined && instance != undefined) {
    name = name || helpers.lcFirst(instance.name);
    Factory.set(name, type, instance, passArguments);
  } else if(name == undefined) {
    throw new Error('Bad inject call, missing either name, type or instance')
    }

  //Create local object with constructor.
  let instanceCopy: any = function(...args: any[]) {
    let container = Factory.get(name, { passArguments });
    if(container.type == containerType.SINGLETON) {
      this[name] = container.object;
    } else if(container.type == containerType.MODEL) {
      this[name] = new container.instance(...passArguments);
    } else {
      this[name] = container.instance;
  }
    return apa.apply(this, args);
}

  //Set local object to use the original prototype
  instanceCopy.prototype = apa.prototype;

  //Return the copy (will be same as original object)
  return instanceCopy;
};*/