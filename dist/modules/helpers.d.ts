import * as BluebirdPromise from 'bluebird';
export declare let toJson: (object: any) => JSON;
export declare let hash: (plainText: string) => string;
export declare let hashCheck: (plainText: string, hash: string) => boolean;
export declare let signJwt: (payload: any) => string;
export declare let decodeJwt: (token: string) => any;
export declare let verifyJwt: (token: string) => boolean;
export declare let dateFormat: (date?: Date) => string;
export declare let substr: (input: string, start?: number, end?: number) => string;
export declare let ucFirst: (value: string) => string;
export declare let groupBy: (objects: {
    [key: string]: any;
}[], keys: string | string[]) => any;
export declare let unique: (array: string[]) => string[];
export declare let isValidDate: (date: Date) => boolean;
export declare let promiseToBluebird: <T>(promise: Promise<T>) => BluebirdPromise<T>;
