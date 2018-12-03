
import * as Promise from 'es6-promise';
import * as _model from './modules/orm/model';
import * as _relation from './modules/orm/relation';
import * as _statement from './modules/orm/statement';
import * as _server from './modules/server';
import * as _helpers from './modules/helpers';
import * as _prom from './modules/prom';
import * as _storage from './modules/storage';
import * as _config from './modules/config';
import * as _models from './models';
import * as _container from './modules/container';
import * as _validation from './modules/validation';
import { auth as _auth } from './services/auth';
import { hash as _hash } from './services/hash';
import { jwt as _jwt } from './services/jwt';

export import Promise = Promise.Promise;
export type PromiseResolve<T> = (value?: T | Promise.Thenable<T>) => void;
export type PromiseReject = (error?: any) => void;

export namespace ORM {
  export import Model = _model.Model;
  export namespace model {
    export import definition = _model.acceptedRelation;
    export import serialize = _model.serialize;
  }

  export import Relation = _relation.Relation;
  export namespace relation {
    export import definition = _relation.definition;
    export import type = _relation.type;
  }

  export import Statement = _statement.Statement;
  export namespace statement {
    export import select = _statement.select;
    export import where = _statement.where;
    export import whereNull = _statement.whereNull;
    export import join = _statement.join;
  }
}

export namespace Models {
  export import User = _models.User;
  export import Group = _models.Group;
  export import Claim = _models.Claim;
}

export namespace Services {
  export let auth = _auth;
  export let hash = _hash;
  export let jwt = _jwt;
}

export import server = _server;
export import Server = _server.Server;
export import helpers = _helpers;
export import prom = _prom;
export import Prom = _prom.Prom;
export import storage = _storage;
export import storageInstance = _storage.instance;
export import config = _config.config;
export import container = _container;
export import containerInstance = _container.container;
export import Validation = _validation.Validation;
export import validate = _validation.validate
export import validation = _validation.validation;