export class Broadcast {
  public static getInstance(): Broadcast { return this.instance || (this.instance = new this()); }
  private static instance: Broadcast;

  private observers: { [key: string]: Array<(...args: any[]) => any> | null } = {};

  public subscribe<T>(name: string) {
    let index: number;
    if (Object.keys(this.observers).findIndex((observerName: string) => observerName === name) !== -1) {
      index = this.observers[name].length;
      this.observers[name].push(null);
    } else {
      index = 0;
      this.observers[name] = [null];
    }
    const unsubscribe = () => {
      this.observers[name].splice(index, 1);
    };

    return {
      then: (callback: (payload: T) => void) => {
        this.observers[name][index] = callback;
        return { unsubscribe };
      }, unsubscribe,
    };
  }
  public emit(name: string, payload?: any) {
    if (this.observers[name]) {
      this.observers[name].forEach((observer: (...args: any[]) => any) => {
        observer(payload);
      });
    }
  }
}

export let broadcast = Broadcast.getInstance();
