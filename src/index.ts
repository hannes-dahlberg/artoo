import * as _model from './modules/orm/model';
import * as _relation from './modules/orm/relation';
import * as _statement from './modules/orm/statement';

import * as _helpers from './modules/helpers';
import * as _prom from './modules/prom';
import * as _storage from './modules/storage';

import * as _models from './models'

export namespace ORM {
  export import model = _model;
  export import Model = _model.Model;
  export import relation = _relation;
  export import Relation = _relation.Relation;
  export import statement = _statement;
  export import Statement = _statement.Statement;
}

export import Models = _models;

export import helpers = _helpers;
export import Prom = _prom.Prom;
export import prom = _prom;
export import storage = _storage;