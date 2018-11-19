import * as bcrypt from 'bcrypt';

import { container } from '../modules/container';
import { ReturnTypeType } from '../modules/helpers';

type bcryptHashSyncFunctionType = (data: any, saltOrRounds: string | number) => string;
type bcryptCompareSyncFunctionType = (data: any, encrypted: string) => boolean;

export class Hash {
  public constructor(
    private readonly bcryptHashSyncFunction: bcryptHashSyncFunctionType = container.get('jwt.sign', bcrypt.hashSync),
    private readonly bcryptCompareSyncFunction: bcryptCompareSyncFunctionType = container.get('jwt.sign', bcrypt.compareSync),
) {}

  public create(plainText: string): ReturnTypeType<bcryptHashSyncFunctionType> {
      return this.bcryptHashSyncFunction(plainText, 10);
  }
  public check(plainText: string, hash: string): ReturnTypeType<bcryptCompareSyncFunctionType> {
      return this.bcryptCompareSyncFunction(plainText, hash);
  }
}

export let hash = container.getService(Hash, { useName: 'service.hash' });