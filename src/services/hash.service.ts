import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

import { container } from "../modules/container.module";
import * as fs from "fs";

type bcryptHashSyncFunctionType = (data: any, saltOrRounds: string | number) => string;
type bcryptCompareSyncFunctionType = (data: any, encrypted: string) => boolean;

export class HashService {
    public constructor(
        private readonly bcryptHashSyncFunction: bcryptHashSyncFunctionType = container.get("hash.create", bcrypt.hashSync),
        private readonly bcryptCompareSyncFunction: bcryptCompareSyncFunctionType = container.get("hash.check", bcrypt.compareSync),
    ) { }

    public create(plainText: string): string {
        return this.bcryptHashSyncFunction(plainText, 10);
    }
    public check(plainText: string, hashString: string): boolean {
        return this.bcryptCompareSyncFunction(plainText, hashString);
    }
    public file(path: string): string {
        return crypto.createHash("md5").update(fs.readFileSync(path).toString()).digest("hex");
    }
}
