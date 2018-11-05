export enum containerType {
  SINGLETON = 'singleton',
  MODEL = 'model',
  OBJECT = 'object',
  STATIC = 'static'
}

export class Factory {
  public static container: { [key:string]: {
    type: containerType,
    object: any
  } } = {};
  public static registerSingleton<T>(name: string, instance: { new(...args: any[]): T }, passArguments: any[] = []) {
    this.set(name, containerType.SINGLETON, new instance(...passArguments));
  }
  public static registerModel<T>(name: string, instance: { new(...args: any[]): T }) {
    this.set(name, containerType.MODEL, instance);
  }
  public static registerObject<T>(name: string, object: T) {
    this.set(name, containerType.OBJECT, object);
  }
  public static registerStatic<T>(name: string, instance: { new(...args: any[]): T }) {
    this.set(name, containerType.STATIC, instance);
  }
  private static set(name: string, type: containerType, object: any): void {
    if(!this.container[name]) { this.container[name] = { type, object }; }
  }

  public static singleton<T>(name: string): T {
    return <T>this.get(name, containerType.SINGLETON);
  }
  public static model<T>(name: string, passArguments: any[] = []): T {
    return <T>(new (this.get(name, containerType.MODEL))(...passArguments));
  }
  public static object<T>(name: string) {
    return <T>this.get(name, containerType.OBJECT);
  }
  public static static<T>(name: string) {
    return this.get(name, containerType.STATIC);
  }
  private static get(name: string, type: containerType): any {
    if(this.container[name] && this.container[name].type == type) {
      return this.container[name].object;
    }

    throw new Error('Object could not be found');
  }
}