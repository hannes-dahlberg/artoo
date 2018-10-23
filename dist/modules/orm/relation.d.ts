import { Model } from './model';
import { Statement } from './statement';
import { entity } from '../../modules/storage';
export declare type relationDefinition = {
    type: 'self' | 'foreign' | 'pivot';
    table?: string;
    key: string;
    secondKey?: string;
    id?: null;
};
export declare class Relation<T extends Model> extends Statement<T> {
    private relationInfo;
    constructor(model: typeof Model, relationInfo: relationDefinition);
    attach(entities: number | entity | (number | entity)[], explicit?: boolean): Promise<void>;
    detach(relation?: number | entity | (number | entity)[]): Promise<void>;
}
