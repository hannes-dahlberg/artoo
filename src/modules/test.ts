import 'reflect-metadata';
import { injector, service, container } from './container';

@service()
class MySingleton {
  public foo: string = 'bar';
  public create() {

  }
}

class MyFakeSingleton {
  public foo: string = 'FAKER';
}

container.set(MyFakeSingleton, 'MySingleton');

class MyModel {
  public foo: string = 'world';
  public static bar: string = 'aa';
}

class Foo {
  public mySingleton: MySingleton = container.get('MySingleton');
  public myModelInstance: MyModel = container.create(MyModel);
  public myModel: typeof MyModel = container.getClassInstance(MyModel);
}

var a = new Foo();

console.log(a.mySingleton.foo);
console.log(a.myModelInstance.foo);
console.log(a.myModel.bar);

/*import { Factory, containerType, injector, inject } from './factory';

@injector(containerType.SINGLETON)
class MySingleton {
  public foo: string = 'Hello World';
  constructor() {
    console.log('my singleton inited')
  }
}

@injector(containerType.MODEL)
class MyModel {
  public constructor(public foo: string) {}
}

@injector(containerType.STATIC)
class MyStatic {
  public static foo: string = 'bar';
}

type configs = { [key:string]: string };
let configs: configs = {
  key: 'MY_SECRET_KEY'
};

class MySecondSingleton {
  public data: any = { foo: 'bar' }
}

@inject('mySingleton')
@inject({ name: 'myModel', passArguments: ['apa']})
@inject('myStatic')
@inject({ type: containerType.SINGLETON, instance: MySecondSingleton })
class Foo {
  public constructor(public hello: string = 'world') {
    
  }
  public readonly mySingleton: MySingleton;
  public readonly mySecondSingleton: MySecondSingleton;
  public readonly myModel: MyModel;
  public readonly myStatic: typeof MyStatic;

  public myMethod(mySingleton: MySingleton): void {
  }
}


var a = new Foo('joo');
var b = new Foo();

console.log('A singleton', a.mySingleton);
console.log('B singleton', b.mySingleton);
console.log('singleton', a.mySingleton == b.mySingleton);
console.log('A model', a.myModel);
console.log('B model', b.myModel);
console.log('model', a.myModel == b.myModel);
console.log('A static', a.myStatic.foo);
console.log('B static', b.myStatic.foo);
console.log('static', a.myStatic == b.myStatic);
console.log('A second singleton', a.mySecondSingleton);
console.log('B second singleton', b.mySecondSingleton);
console.log('second singleton', a.mySecondSingleton == b.mySecondSingleton);*/
/*
Factory.registerSingleton('mySingleton', MySingleton, ['sfewfew']);
Factory.registerObject('configs', configs);
Factory.registerModel('myModel', MyModel);

class Foo {
  constructor(
    public readonly mySingeton: MySingleton = Factory.singleton('mySingleton'),
    public readonly myObject: configs = Factory.object('configs'),
    public readonly myModel: MySingleton = Factory.model('myModel')
  ) { }
}

var a = new Foo();
var b = new Foo();

console.log(a.myModel)
console.log(a.myModel == b.myModel)*/