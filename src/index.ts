import * as _model from './modules/orm/model';
import * as _relation from './modules/orm/relation';
import * as _statement from './modules/orm/statement';
import * as _server from './modules/server';
import * as _helpers from './modules/helpers';
import * as _prom from './modules/prom';
import * as _storage from './modules/storage';
import * as _models from './models';

export namespace ORM {
  export import model = _model;
  export import Model = _model.Model;
  export import relation = _relation;
  export import Relation = _relation.Relation;
  export import statement = _statement;
  export import Statement = _statement.Statement;
}

export namespace Models {
  export import User = _models.User;
  export import Group = _models.Group;
}

export import server = _server;
export import Server = _server.Server;
export import helpers = _helpers;
export import prom = _prom;
export import Prom = _prom.Prom;
export import storage = _storage;
