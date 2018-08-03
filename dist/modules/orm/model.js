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
var BluebirdPromise = require("bluebird");
var helpers = require("../../modules/helpers");
var prom_1 = require("../../modules/prom");
var relation_1 = require("./relation");
var statement_1 = require("./statement");
var storage_1 = require("../../modules/storage");
function serialize(objects) {
    return objects.map(function (object) { return object.serialize(); });
}
exports.serialize = serialize;
var Model = (function () {
    function Model(entity) {
        if (entity === void 0) { entity = {}; }
        var _this = this;
        Object.keys(entity).forEach(function (key) {
            _this[key] = entity[key];
        });
    }
    Model.where = function (where, value) {
        return this.getStatement().where(where, value);
    };
    Model.whereIsNull = function (column) {
        return this.getStatement().whereIsNull(column);
    };
    Model.whereIsNotNull = function (column) {
        return this.getStatement().whereIsNotNull(column);
    };
    Model.get = function () {
        return this.getStatement().get();
    };
    Model.first = function () {
        return this.getStatement().first();
    };
    Model.exists = function (id) {
        return this.getStatement().exists(id);
    };
    Model.find = function (id) {
        return this.where('id', id.toString()).first();
    };
    Model.create = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var insertData = {};
            _this.getSelf().fillable.forEach(function (attribute) {
                if (data[attribute]) {
                    insertData[attribute] = data[attribute];
                }
            });
            _this.getStatement().insert(insertData).then(function (entity) {
                resolve(new (_this.getSelf())(entity));
            }).catch(function (error) { return reject(error); });
        });
    };
    Model.delete = function (entity) {
        if (typeof entity == 'number') {
            storage_1.storage.delete({ table: this.table, id: entity });
        }
        else if (entity instanceof Array) {
            storage_1.storage.delete({ table: this.table, id: entity.map(function (entity) { return typeof entity == 'number' ? entity : entity.id; }) });
        }
        else {
            storage_1.storage.delete({ table: this.table, id: entity.id });
        }
    };
    Model.prototype.save = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var model = _this.constructor;
            var updateData = {};
            model.fields.forEach(function (attribute) {
                if (_this[attribute]) {
                    updateData[attribute] = _this[attribute];
                }
            });
            model.getStatement()[updateData.id ? 'update' : 'insert'](updateData).then(function (entity) {
                model.fields.forEach(function (attribute) { return _this[attribute] = entity[attribute]; });
                resolve();
            }).catch(function (error) { return reject(error); });
        });
    };
    Model.prototype.delete = function () {
        var model = this.constructor;
        return model.getStatement().delete(this.id);
    };
    Model.prototype.fill = function (data, acceptedRelations) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!acceptedRelations) {
                acceptedRelations = [];
            }
            else if (!(acceptedRelations instanceof Array)) {
                acceptedRelations = [acceptedRelations];
            }
            if (acceptedRelations.length > 0) {
                acceptedRelations = acceptedRelations.map(function (acceptedRelation) {
                    if (typeof acceptedRelation == 'string') {
                        acceptedRelation = acceptedRelation.split('.').map(function (split) { return ({ relation: split, explicit: false }); });
                    }
                    else if (!(acceptedRelation instanceof Array)) {
                        acceptedRelation = [acceptedRelation];
                    }
                    return acceptedRelation;
                });
            }
            var model = _this.constructor;
            model.fillable.forEach(function (attribute) {
                if (data[attribute]) {
                    _this[attribute] = data[attribute];
                }
            });
            _this.save().then(function () {
                var relations = model.getRelations();
                if (!relations) {
                    relations = {};
                }
                var promises = [];
                Object.keys(relations).filter(function (key) { return !!data['_' + key] && acceptedRelations.map(function (acceptedRelation) { return acceptedRelation[0].relation; }).indexOf(key) != -1; }).forEach(function (key) {
                    var newAcceptedRelation = acceptedRelations.map(function (acceptedRelation) { return acceptedRelation.slice(1, acceptedRelation.length); }).filter(function (acceptedRelation) { return acceptedRelation.length; });
                    var relation = relations[key];
                    var tempData = data['_' + key];
                    if (relation.type == 'one') {
                        tempData = [tempData];
                    }
                    tempData.forEach(function (entityData, index) {
                        promises.push(function () { return new BluebirdPromise(function (resolve, reject) {
                            if (entityData.id) {
                                relation.model.exists(entityData.id).then(function (entity) {
                                    entity.fill(entityData, newAcceptedRelation).then(function () {
                                        if (relation.type == 'one') {
                                            data['_' + key] = entity;
                                        }
                                        else {
                                            data['_' + key][index] = entity;
                                        }
                                        resolve();
                                    }).catch(function (error) { return reject(error); });
                                }).catch(function (error) { return reject(error); });
                            }
                            else {
                                var entity_1 = (new relation.model());
                                entity_1.fill(entityData, newAcceptedRelation).then(function () {
                                    if (relation.type == 'one') {
                                        data['_' + key] = entity_1;
                                    }
                                    else {
                                        data['_' + key][index] = entity_1;
                                    }
                                    resolve();
                                }).catch(function (error) { return reject(error); });
                            }
                        }); });
                    });
                });
                if (promises.length == 0) {
                    resolve();
                    return;
                }
                prom_1.Prom.sequence(promises, { mode: prom_1.Mode.simultaneous, breakOnReject: true }).then(function (output) {
                    if (output.rejects) {
                        reject(output.results.find(function (result) { return result.error; }));
                        return;
                    }
                    var promises = [];
                    Object.keys(relations).filter(function (key) { return !!data['_' + key]; }).forEach(function (key) {
                        var explicit = !!acceptedRelations.find(function (acceptedRelation) { return acceptedRelation[0].relation == key && acceptedRelation[0].explicit; });
                        promises.push(function () { return new BluebirdPromise(function (resolve, reject) { return _this[key]().attach(data['_' + key], explicit).then(function () {
                            _this["_" + key] = data["_" + key];
                            resolve();
                        }).catch(function (error) { return reject(error); }); }); });
                    });
                    prom_1.Prom.sequence(promises, { mode: prom_1.Mode.simultaneous, breakOnReject: true }).then(function (output) {
                        if (output.rejects) {
                            reject(output.results[0].error);
                            return;
                        }
                        resolve();
                    });
                });
            }).catch(function (error) { return reject(error); });
        });
    };
    Model.prototype.serialize = function () {
        var _this = this;
        var model = this.constructor;
        var returnObject = {};
        model.fields.concat(model.append).filter(function (field) { return model.hidden.indexOf(field) == -1; }).forEach(function (field) {
            returnObject[field] = _this[field];
        });
        Object.keys(this).filter(function (key) { return key[0] == '_'; }).forEach(function (key) {
            if (_this[key]) {
                if (_this[key] instanceof Array) {
                    returnObject[key.substr(1, key.length)] = _this[key].map(function (object) { return object.serialize(); });
                }
                else {
                    returnObject[key.substr(1, key.length)] = _this[key].serialize();
                }
            }
        });
        return returnObject;
    };
    Model.prototype.hasMany = function (model, columnKey) {
        var foreignTable = model.table;
        if (!this.id) {
            return { model: model, join: { table: foreignTable, firstColumn: 'id', secondColumn: columnKey }, type: 'many' };
        }
        return model.getRelationStatement({
            type: 'foreign',
            table: foreignTable,
            key: columnKey,
            id: this.id
        }).where({ column: columnKey, operator: '=', value: this.id });
    };
    Model.prototype.belongsTo = function (model, columnKey) {
        var foreignTable = model.table;
        if (!this.id) {
            return { model: model, join: { table: foreignTable, firstColumn: columnKey, secondColumn: 'id' }, type: 'one' };
        }
        return model.getRelationStatement({
            table: this.constructor.table,
            type: 'self',
            key: columnKey,
            id: this.id
        }).where({ column: 'id', operator: '=', value: this[columnKey] });
    };
    Model.prototype.belongsToMany = function (model, pivotTable, firstColumnKey, secondColumnKey) {
        var foreignTable = model.table;
        if (!this.id) {
            return { model: model, join: [
                    { table: pivotTable, firstColumn: 'id', secondColumn: firstColumnKey },
                    { table: foreignTable, sourceTable: pivotTable, firstColumn: secondColumnKey, secondColumn: 'id' }
                ], type: 'many' };
        }
        return model.getRelationStatement({
            type: 'pivot',
            table: pivotTable,
            key: firstColumnKey,
            secondKey: secondColumnKey,
            id: this.id
        }).join({ table: pivotTable, firstColumn: 'id', secondColumn: secondColumnKey }).where(pivotTable + '.' + firstColumnKey, this.id);
    };
    Model.getRelation = function (relation) {
        var self = this.getInstance();
        if (relation in self) {
            return self[relation]();
        }
        return null;
    };
    Model.getRelations = function () {
        var instance = this.getInstance();
        var returnObject;
        Object.keys(instance).filter(function (key) { return key[0] == '_'; }).forEach(function (key) {
            var relationKey = helpers.substr(key, 1, key.length);
            if (!returnObject) {
                returnObject = {};
            }
            if (instance[relationKey]) {
                returnObject[relationKey] = instance[relationKey]();
            }
        });
        return returnObject;
    };
    Model.with = function (relations, statement, parent) {
        var _this = this;
        if (typeof relations == 'string') {
            relations = [relations];
        }
        var returnStatement = statement ? statement : this.getStatement();
        relations.forEach(function (relation) {
            var splitRelation = relation.split('.');
            var relationResult = _this.getRelation(splitRelation[0]);
            if (relationResult) {
                returnStatement = returnStatement
                    .select('self')
                    .select(relationResult.model.fields.map(function (field) { return ({ table: relationResult.model.table, column: field, as: (parent ? parent + '.' : _this.table + '.') + splitRelation[0] + '.' + field }); }));
                if (relationResult.join instanceof Array) {
                    relationResult.join.forEach(function (join) {
                        returnStatement = returnStatement.join(__assign({ sourceTable: _this.table }, join));
                    });
                }
                else {
                    returnStatement = returnStatement.join(__assign({}, relationResult.join, { sourceTable: _this.table }));
                }
                if (splitRelation[1]) {
                    returnStatement = relationResult.model.with(splitRelation.slice(1, splitRelation.length).join('.'), returnStatement, (parent ? parent + '.' + splitRelation[0] : _this.table + '.' + splitRelation[0]));
                }
            }
        });
        return returnStatement;
    };
    Model.getStatement = function () {
        return new statement_1.Statement(this.getSelf());
    };
    Model.getRelationStatement = function (relationInfo) {
        if (!relationInfo.table) {
            relationInfo.table = this.getSelf().table;
        }
        return new relation_1.Relation(this.getSelf(), relationInfo);
    };
    Model.getSelf = function () {
        return Model;
    };
    Model.getInstance = function () {
        return new Model();
    };
    Object.defineProperty(Model, "statement", {
        get: function () {
            return this.getStatement().statement;
        },
        enumerable: true,
        configurable: true
    });
    Model.fillable = [];
    Model.hidden = [];
    Model.append = [];
    return Model;
}());
exports.Model = Model;
