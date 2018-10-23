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
var storage_1 = require("../../modules/storage");
var helpers = require("../../modules/helpers");
var Statement = (function () {
    function Statement(model, table, fields) {
        if (table === void 0) { table = model.table; }
        if (fields === void 0) { fields = model.fields; }
        this.model = model;
        this.table = table;
        this.fields = fields;
        this.selects = [];
        this.wheres = [];
        this.whereNulls = [];
        this.joins = [];
        this.orderBys = [];
    }
    Statement.prototype.select = function (selects) {
        var _this = this;
        if (selects == 'self') {
            if (this.selects.findIndex(function (select) { return typeof select != 'string' && select.table == _this.table && select.column == _this.fields[0]; })) {
                this.fields.forEach(function (field) {
                    _this.selects.push({ table: _this.table, column: field });
                });
            }
        }
        else if (selects instanceof Array) {
            this.selects = this.selects.concat(selects);
        }
        else {
            this.selects.push(selects);
        }
        return this;
    };
    Statement.prototype.where = function (where, value) {
        if (typeof where == 'string') {
            var whereSplit = where.split('.');
            var whereTable = whereSplit.length == 2 ? whereSplit[0] : null;
            var whereColumn = whereSplit.length == 2 ? whereSplit[1] : whereSplit[0];
            this.wheres.push(__assign({}, (whereTable ? { table: whereTable } : {}), { column: whereColumn, operator: '=', value: value }));
        }
        else if (where.column) {
            this.wheres.push(where);
        }
        return this;
    };
    Statement.prototype.whereIsNull = function (column) {
        return this.whereNull(column);
    };
    Statement.prototype.whereIsNotNull = function (column) {
        return this.whereNull(column, 'NOT NULL');
    };
    Statement.prototype.whereNull = function (column, condition) {
        if (condition === void 0) { condition = 'NULL'; }
        var whereSplit = column.split('.');
        var whereTable = whereSplit.length == 2 ? whereSplit[0] : null;
        var whereColumn = whereSplit.length == 2 ? whereSplit[1] : whereSplit[0];
        this.whereNulls.push(__assign({}, (whereTable ? { table: whereTable } : {}), { column: whereColumn, condition: condition }));
        return this;
    };
    Statement.prototype.orderBy = function (orderBy, desc) {
        if (typeof orderBy == 'string') {
            var orderBySplit = orderBy.split('.');
            var orderByTable = orderBySplit.length == 2 ? orderBySplit[0] : null;
            var orderByColumn = orderBySplit.length == 2 ? orderBySplit[1] : orderBySplit[0];
            this.orderBys.push(__assign({}, (orderByTable ? { table: orderByTable } : {}), { column: orderByColumn }, (desc != undefined ? { desc: desc } : {})));
        }
        else if (orderBy.column) {
            this.orderBys.push(orderBy);
        }
        return this;
    };
    Statement.prototype.find = function (id) {
        return this.where('id', id.toString()).first();
    };
    Statement.prototype.join = function (join) {
        this.joins.push(join);
        return this;
    };
    Statement.prototype.scope = function (name) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var _a;
        name = helpers.ucFirst(name);
        if (this.model["scope" + name]) {
            return (_a = this.model)["scope" + name].apply(_a, [this].concat(params));
        }
        return this;
    };
    Object.defineProperty(Statement.prototype, "statement", {
        get: function () {
            var _this = this;
            if (!this.selects.length) {
                this.select('self');
            }
            var statement = "SELECT";
            if (this.selects.length) {
                statement += " " + this.selects
                    .map((function (select) { return (typeof select == 'string') ? select : "[" + select.table + "].[" + select.column + "] AS " + (select.as ? "[" + select.as + "]" : "[" + select.table + "." + select.column + "]"); }))
                    .join(', ');
            }
            statement += " FROM [" + this.table + "]";
            if (this.joins.length) {
                statement += " " + this.joins
                    .map((function (join) { return "LEFT JOIN [" + join.table + "]" + (join.alias ? " AS " + join.alias : '') + " ON [" + (join.sourceTable ? join.sourceTable : _this.table) + "].[" + join.firstColumn + "] = [" + (join.alias ? join.alias : join.table) + "].[" + join.secondColumn + "]"; }))
                    .join(' ');
            }
            if (this.wheres.length) {
                statement += " WHERE " + this.wheres
                    .map((function (where) { return "[" + (where.table ? where.table : _this.table) + "].[" + where.column + "] " + (where.operator ? where.operator : '=') + " '" + where.value + "'"; }))
                    .join(' AND ');
            }
            if (this.whereNulls.length) {
                statement += (this.wheres.length ? " AND " : " WHERE ") + this.whereNulls
                    .map((function (whereNull) { return "[" + (whereNull.table ? whereNull.table : _this.table) + "].[" + whereNull.column + "] IS " + whereNull.condition; }))
                    .join(' AND ');
            }
            if (this.orderBys.length) {
                statement += " ORDER BY " + this.orderBys
                    .map(function (orderBy) { return "[" + (orderBy.table ? orderBy.table : _this.table) + "].[" + orderBy.column + "] " + (orderBy.desc ? 'DESC' : 'ASC'); });
            }
            return statement;
        },
        enumerable: true,
        configurable: true
    });
    Statement.prototype.get = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            storage_1.storage.getAll(_this.statement).then(function (rows) {
                if (!rows.length) {
                    resolve([]);
                    return;
                }
                var myMap = function (relationName, model, rows) {
                    return helpers.groupBy(rows, model.fields.map(function (field) { return relationName + "." + field; })).map(function (row) {
                        var tempObject = new (model)();
                        Object.keys(row).filter(function (key) { return key != '_rows'; }).forEach(function (key) {
                            tempObject[key.substr(key.indexOf('.') + 1, key.length)] = row[key];
                        });
                        if (row._rows) {
                            row._rows = row._rows = row._rows.map(function (row) {
                                var returnObject = {};
                                Object.keys(row).forEach(function (key) {
                                    returnObject[key.substr(key.indexOf('.') + 1, key.length)] = row[key];
                                });
                                return returnObject;
                            });
                            var relations = helpers.unique(Object.keys(row._rows[0]).map(function (key) { return key.substr(0, key.indexOf('.')); }));
                            relations.forEach(function (relation) {
                                var fetchRelation = model.getRelation(relation);
                                if (fetchRelation) {
                                    tempObject["_" + relation] = myMap(relation, model.getRelation(relation).model, row._rows).filter(function (object) { return object != null; });
                                    if (fetchRelation.type == 'one') {
                                        tempObject["_" + relation] = tempObject["_" + relation][0] ? tempObject["_" + relation][0] : null;
                                    }
                                }
                            });
                        }
                        return tempObject.id != null ? tempObject : null;
                    });
                };
                resolve(myMap(_this.table, _this.model, rows));
            }).catch(function (error) { return reject(error); });
        });
    };
    Statement.prototype.first = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.get().then(function (rows) { return resolve(rows.length ? rows[0] : null); })
                .catch(function (error) { return reject(error); });
        });
    };
    Statement.prototype.exists = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var statement = _this;
            if (id) {
                statement.where('id', id.toString());
            }
            statement.first().then(function (row) {
                if (!row) {
                    reject(new Error('No entity found'));
                    return;
                }
                resolve(row);
            }).catch(function (error) { return reject(error); });
        });
    };
    Statement.prototype.insert = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            storage_1.storage.insert({ table: _this.table, data: data }).then(function (entity) {
                resolve(entity);
            }).catch(function (error) { return reject(error); });
        });
    };
    Statement.prototype.update = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            storage_1.storage.update({ table: _this.table, data: data }).then(function (entity) {
                resolve(entity);
            }).catch(function (error) { return reject(error); });
        });
    };
    Statement.prototype.delete = function (id) {
        return storage_1.storage.delete({ table: this.table, id: id });
    };
    return Statement;
}());
exports.Statement = Statement;
