"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var model = require("./modules/orm/model");
var relation = require("./modules/orm/relation");
var statement = require("./modules/orm/statement");
var helpers = require("./modules/helpers");
var prom = require("./modules/prom");
var storage = require("./modules/storage");
exports.Artoo = {
    ORM: __assign({}, model, relation, statement),
    helpers: helpers,
    Prom: prom.Prom,
    prom: prom,
    storage: storage
};
