import { container } from './modules/container';

class MyStatic {
  public static foo: string = 'Hello Static';
}
class MyService {
  public foo: number = (new Date()).getTime();
  public constructor(a: string, b: number) {}
}
class MyModel {
  public foo: number = (new Date()).getTime();

  public constructor(a: number, b: string) {}
}

type myType = { foo: string };
let myType = { foo: 'Hello Type' };

let a: typeof MyStatic = container.get(MyStatic);
let b: MyService = container.getService(MyService);
let c: MyModel = container.create(MyModel);
let d: myType = container.get('myType', myType);

setTimeout(() => {
  let aCopy: typeof MyStatic = container.get(MyStatic);
  let bCopy: MyService = container.getService(MyService);
  let cCopy: MyModel = container.create(MyModel, [1, 'fee']);
  let dCopy: myType = container.get('myType', myType);
  
  console.log(a.foo, aCopy.foo, a === aCopy);
  console.log(b.foo, bCopy.foo, b === bCopy);
  console.log(c.foo, cCopy.foo, c === cCopy);
  console.log(d.foo, dCopy.foo, d === dCopy);
  }, 1000)

  container.set('hlee', '22');
  console.log(container.get('hlee', '43523'))