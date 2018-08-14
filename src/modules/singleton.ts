export class Singleton {
    private static instance: any;
    static getInstance<U>(): U { return this.instance || (this.instance = new this()); }
}