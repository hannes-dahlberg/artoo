"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sqlite3 = require("sqlite3");
var path = require("path");
var configs_1 = require("./configs");
var Storage = (function () {
    function Storage() {
        this.db = new (sqlite3.verbose()).Database(path.resolve(configs_1.default.paths.storage, 'db.sqlite'), sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE);
    }
    Storage.getInstance = function () { return Storage.instance || (Storage.instance = new Storage()); };
    Storage.prototype.checkTable = function (tableName) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.db.get("SELECT COUNT(*) as [count] FROM sqlite_master WHERE name = '" + tableName + "' and type = 'table'", function (error, result) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(!!result.count);
            });
        });
    };
    Storage.prototype.getFromId = function (_a) {
        var _this = this;
        var table = _a.table, id = _a.id;
        return new Promise(function (resolve, reject) {
            _this.db.get("SELECT * FROM [" + table + "] WHERE id = " + id, function (error, row) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(row);
            });
        });
    };
    Storage.prototype.getTable = function (table) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.db.all("SELECT * FROM [" + table + "]", function (error, rows) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(rows);
            });
        });
    };
    Storage.prototype.get = function (statement) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.db.get(statement, function (error, row) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(row);
            });
        });
    };
    Storage.prototype.getAll = function (statement) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.db.all(statement, function (error, rows) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(rows);
            });
        });
    };
    Storage.prototype.insert = function (_a) {
        var _this = this;
        var table = _a.table, data = _a.data;
        return new Promise(function (resolve, reject) {
            if (!(data instanceof Array)) {
                data = [data];
            }
            var _self = _this;
            _this.db.run("INSERT INTO [" + table + "] (" + _this.entityKeys(data[0]) + ") VALUES(" + data.map(function (data) { return _this.entityValues(data); }).join(' VALUES(') + ")", function (error) {
                if (error) {
                    reject(error);
                    return;
                }
                _self.getFromId({ table: table, id: this.lastID }).then(function (row) { return resolve(row); }).catch(function (error) { return reject(error); });
            });
        });
    };
    Storage.prototype.update = function (_a) {
        var _this = this;
        var data = _a.data, table = _a.table, _b = _a.alternateKey, alternateKey = _b === void 0 ? null : _b, _c = _a.noKey, noKey = _c === void 0 ? false : _c;
        return new Promise(function (resolve, reject) {
            if (!(data instanceof Array)) {
                data = [data];
            }
            if (!noKey && !alternateKey && data.findIndex(function (entity) { return !entity.id; }) != -1) {
                reject(new Error('provided data has no ID value'));
                return;
            }
            var statement = '';
            data.forEach(function (entity) {
                statement += "UPDATE [" + table + "] SET " + _this.entitySetValues(entity) + " " + (!noKey ? "WHERE [" + (alternateKey ? alternateKey.name : "id") + "] = " + (alternateKey ? alternateKey.value : entity.id.toString()) : "") + "; ";
            });
            _this.db.exec(statement, function (error) {
                if (error) {
                    reject(error);
                    return;
                }
                if (!noKey && !alternateKey && data.length == 1) {
                    _this.getFromId({ table: table, id: data[0].id }).then(function (row) { return resolve(row); }).catch(function (error) { return reject(error); });
                    return;
                }
                resolve();
            });
        });
    };
    Storage.prototype.delete = function (_a) {
        var _this = this;
        var table = _a.table, _b = _a.id, id = _b === void 0 ? null : _b, _c = _a.alternateKey, alternateKey = _c === void 0 ? null : _c;
        return new Promise(function (resolve, reject) {
            if (!id && !alternateKey) {
                reject('ID is missing');
                return;
            }
            var key = id ? 'id' : alternateKey.name;
            var value = id ? (id instanceof Array ? id.map(function (id) { return id.toString(); }) : id.toString()) : alternateKey.value;
            _this.db.run("DELETE FROM [" + table + "] where [" + key + "] " + (typeof value == 'string' ? " = '" + value + "'" : " IN(" + value.join(', ') + ")"), function (error) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    };
    Storage.prototype.execute = function (query) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.db.exec(query, function (error) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    };
    Storage.prototype.entityKeys = function (data) {
        return Object.keys(data).map(function (key) { return "[" + key + "]"; }).join(', ');
    };
    Storage.prototype.entityValues = function (data) {
        var _this = this;
        return Object.keys(data).map(function (key) { return "" + _this.parseValue(data[key]); }).join(', ');
    };
    Storage.prototype.entitySetValues = function (data) {
        var _this = this;
        return Object.keys(data).map(function (key) { return "[" + key + "] = " + _this.parseValue(data[key]); }).join(', ');
    };
    Storage.prototype.parseValue = function (value) {
        if (value === null) {
            return "NULL";
        }
        else if (typeof value == 'number') {
            return "" + value;
        }
        else {
            return "'" + value + "'";
        }
    };
    return Storage;
}());
exports.storage = Storage.getInstance();
