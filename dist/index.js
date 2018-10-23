"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _model = require("./modules/orm/model");
var _helpers = require("./modules/helpers");
var _prom = require("./modules/prom");
var _storage = require("./modules/storage");
var ORM;
(function (ORM) {
    ORM.model = _model;
    ORM.Model = _model.Model;
})(ORM = exports.ORM || (exports.ORM = {}));
exports.helpers = _helpers;
exports.Prom = _prom.Prom;
exports.prom = _prom;
exports.storage = _storage;
