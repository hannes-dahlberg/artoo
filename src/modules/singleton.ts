export class Singleton {
    public static getInstance<U>(): U { return this.instance || (this.instance = new this()); }
    private static instance: any;
}
