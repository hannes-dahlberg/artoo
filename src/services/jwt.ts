import * as jsonwebtoken from 'jsonwebtoken';

import { container } from '../modules/container';
import { ReturnTypeType } from '../modules/helpers';

type jwtSignFunctionType = (payload: any, key: string, { expiresIn }: { expiresIn: string }) => string | void;
type jwtDecodeFunctionType = (token: string, key: string) => object | string | void;

export class JWT {
    private readonly expiresIn = '7 days';
    private readonly key = container.get('token', 'EBdVaKyseI');

    constructor(
        private readonly jwtSignFunction: jwtSignFunctionType = container.get('jwt.sign', jsonwebtoken.sign),
        private readonly jwtDecodeFunction: jwtDecodeFunctionType = container.get('jwt.sign', jsonwebtoken.verify),
    ) { }

    public sign(payload: any, { key, expiresIn }: { key?: string, expiresIn?: string } = {}): ReturnTypeType<jwtSignFunctionType> {
        return this.jwtSignFunction(payload, key || this.key, { expiresIn : expiresIn || this.expiresIn });
    }

    public decode(token: string, key?: string): ReturnTypeType<jwtDecodeFunctionType> {
        return this.jwtDecodeFunction(token, key || this.key);
    }

    public verify(token: string, key?: string): boolean {
        return !!this.decode(token, key);
    }
}

export let jwt = container.getService<JWT, typeof JWT>(JWT, { useName: 'service.jwt'});
