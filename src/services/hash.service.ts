import * as bcrypt from "bcrypt";

import { container } from "../modules/container.module";
import { ReturnTypeType } from "../services//helpers.service";

type bcryptHashSyncFunctionType = (data: any, saltOrRounds: string | number) => string;
type bcryptCompareSyncFunctionType = (data: any, encrypted: string) => boolean;

export class HashService {
    public constructor(
        private readonly bcryptHashSyncFunction: bcryptHashSyncFunctionType = container.get("hash.create", bcrypt.hashSync),
        private readonly bcryptCompareSyncFunction: bcryptCompareSyncFunctionType = container.get("hash.check", bcrypt.compareSync),
    ) { }

    public create(plainText: string): ReturnTypeType<bcryptHashSyncFunctionType> {
        return this.bcryptHashSyncFunction(plainText, 10);
    }
    public check(plainText: string, hashString: string): ReturnTypeType<bcryptCompareSyncFunctionType> {
        return this.bcryptCompareSyncFunction(plainText, hashString);
    }
}