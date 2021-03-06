import * as jsonwebtoken from "jsonwebtoken";

import { container } from "../modules/container.module";

type jwtSignFunctionType = (payload: any, key: string, { expiresIn }: { expiresIn: string }) => string | void;
type jwtDecodeFunctionType = (token: string, key: string) => { payload: object, [key: string]: any } | string | void;

export class JWTService {

    constructor(
        private readonly expiresIn = "7 days",
        private readonly key = container.get("token", "EBdVaKyseI"),
        private readonly jwtSignFunction: jwtSignFunctionType = container.get("jwt.sign", jsonwebtoken.sign),
        private readonly jwtDecodeFunction: jwtDecodeFunctionType = container.get("jwt.decode", jsonwebtoken.verify),
    ) { }

    public sign(payload: any, { key, expiresIn }: { key?: string, expiresIn?: string } = {}): string {
        const token = this.jwtSignFunction({ payload }, key || this.key, { expiresIn: expiresIn || this.expiresIn });
        if (typeof token !== "string") { throw new Error("Unable to sign"); }
        return token;
    }

    public decode(token: string, key?: string): object {
        try {
            const decodedToken = this.jwtDecodeFunction(token, key || this.key);
            if (typeof decodedToken !== "object") { throw new Error("Unable to decode"); }

            return decodedToken.payload;

        } catch (e) {
            throw new Error(e);
        }
    }

    public verify(token: string, key?: string): boolean {
        return !!this.decode(token, key);
    }
}
