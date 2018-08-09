import * as _model from './modules/orm/model';
import * as _relation from './modules/orm/relation';
import * as _statement from './modules/orm/statement';

import * as _helpers from './modules/helpers';
import * as _prom from './modules/prom';
import * as _storage from './modules/storage';

export namespace ORM {
    export const model = _model;
    export const Model = _model.Model;
}

export const helpers = _helpers;
export const Prom = _prom.Prom;
export const prom = _prom;
export const storage = _storage;