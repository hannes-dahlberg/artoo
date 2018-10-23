"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var statement_1 = require("./statement");
var storage_1 = require("../../modules/storage");
var Relation = (function (_super) {
    __extends(Relation, _super);
    function Relation(model, relationInfo) {
        var _this = _super.call(this, model) || this;
        _this.relationInfo = relationInfo;
        return _this;
    }
    Relation.prototype.attach = function (entities, explicit) {
        var _this = this;
        if (explicit === void 0) { explicit = false; }
        return new Promise(function (resolve, reject) {
            if (_this.relationInfo.type != 'self' && explicit) {
                _this.detach().then(function () {
                    _this.attach(entities).then(function () { return resolve(); }).catch(function (error) { return reject(error); });
                }).catch(function (error) { return reject(error); });
            }
            if (_this.relationInfo.type == 'self') {
                _this.detach().then(function () {
                    var _a;
                    if (entities instanceof Array) {
                        reject(new Error('Can only attach one instance to the model'));
                        return;
                    }
                    storage_1.storage.update({ table: _this.relationInfo.table, data: (_a = {
                                id: _this.relationInfo.id
                            },
                            _a[_this.relationInfo.key] = (typeof entities == 'number' ? entities : entities.id),
                            _a) }).then(function () { return resolve(); }).catch(function (error) { return reject(error); });
                }).catch(function (error) { return reject(error); });
            }
            else if (_this.relationInfo.type == 'foreign') {
                if (!(entities instanceof Array)) {
                    entities = [entities];
                }
                storage_1.storage.update({ table: _this.table, data: entities.map(function (data) {
                        var _a;
                        return (_a = {
                                id: (typeof data == 'number' ? data : data.id)
                            },
                            _a[_this.relationInfo.key] = _this.relationInfo.id,
                            _a);
                    }) }).then(function () { return resolve(); }).catch(function (error) { return reject(error); });
            }
            else if (_this.relationInfo.type == 'pivot') {
                if (!(entities instanceof Array)) {
                    entities = [entities];
                }
                storage_1.storage.insert({ table: _this.relationInfo.table, data: entities.map(function (data) {
                        var _a;
                        return (_a = {},
                            _a[_this.relationInfo.key] = _this.relationInfo.id,
                            _a[_this.relationInfo.secondKey] = (typeof data == 'number' ? data : data.id),
                            _a);
                    }) }).then(function () { return resolve(); }).catch(function (error) { return reject(error); });
            }
        });
    };
    Relation.prototype.detach = function (relation) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var _a, _b;
            if (_this.relationInfo.type == 'self') {
                storage_1.storage.update({ table: _this.relationInfo.table, data: (_a = {
                            id: _this.relationInfo.id
                        },
                        _a[_this.relationInfo.key] = null,
                        _a) }).then(function () { return resolve(); }).catch(function (error) { return reject(error); });
            }
            else if (_this.relationInfo.type == 'foreign') {
                if (!relation) {
                    storage_1.storage.update({
                        table: _this.table,
                        data: (_b = {}, _b[_this.relationInfo.key] = null, _b),
                        alternateKey: {
                            name: 'project_id',
                            value: _this.relationInfo.id
                        }
                    }).then(function () { return resolve(); })
                        .catch(function (error) { return reject(error); });
                    return;
                }
                if (!(relation instanceof Array)) {
                    relation = [relation];
                }
                storage_1.storage.update({ table: _this.table, data: relation.map(function (data) {
                        var _a;
                        return (_a = {
                                id: (typeof data == 'number' ? data : data.id)
                            },
                            _a[_this.relationInfo.key] = null,
                            _a);
                    }) }).then(function () { return resolve(); }).catch(function (error) { return reject(error); });
            }
            else if (_this.relationInfo.type == 'pivot') {
                if (!relation) {
                    storage_1.storage.delete({ table: _this.relationInfo.table, alternateKey: {
                            name: _this.relationInfo.secondKey,
                            value: _this.relationInfo.id
                        } }).then(function () { return resolve(); }).catch(function (error) { return reject(error); });
                    return;
                }
                if (!(relation instanceof Array)) {
                    relation = [relation];
                }
                storage_1.storage.delete({ table: _this.relationInfo.table, alternateKey: {
                        name: _this.relationInfo.secondKey,
                        value: relation.map(function (data) { return (typeof data == 'number' ? data.toString() : data.id.toString()); })
                    } }).then(function () { return resolve(); }).catch(function (error) { return reject(error); });
            }
        });
    };
    return Relation;
}(statement_1.Statement));
exports.Relation = Relation;
