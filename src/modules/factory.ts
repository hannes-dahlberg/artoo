import * as helpers from './helpers';
import { isRegExp } from 'util';

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
};