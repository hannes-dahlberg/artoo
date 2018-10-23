"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var CrudInterface = (function () {
    function CrudInterface(path) {
        this.path = path;
    }
    CrudInterface.prototype.index = function () {
        var _this = this;
        return function (_a, params) {
            if (params === void 0) { params = {}; }
            return (new Promise(function (resolve, reject) {
                axios_1.default.get(_this.path, { params: params, withCredentials: true }).then(function (response) {
                    resolve(response.data);
                }).catch(function (error) { return reject(error); });
            }));
        };
    };
    CrudInterface.prototype.store = function () {
        var _this = this;
        return function (_a, data) { return (new Promise(function (resolve, reject) {
            axios_1.default.post(_this.path, data).then(function () { return resolve(); }).catch(function (error) { return reject(error); });
        })); };
    };
    CrudInterface.prototype.show = function () {
        var _this = this;
        return function (_a, id) { return (new Promise(function (resolve, reject) {
            axios_1.default.get(_this.path + '/' + id.toString()).then(function (response) {
                resolve(response.data);
            }).catch(function (error) { return reject(error); });
        })); };
    };
    CrudInterface.prototype.update = function () {
        var _this = this;
        return function (_a, data) { return (new Promise(function (resolve, reject) {
            axios_1.default.put(_this.path + '/' + data.id, data).then(function () { return resolve(); }).catch(function (error) { return reject(error); });
        })); };
    };
    CrudInterface.prototype.destroy = function () {
        var _this = this;
        return function (_a, id) { return (new Promise(function (resolve, reject) {
            axios_1.default.delete(_this.path + '/' + id.toString()).then(function () { return resolve(); }).catch(function (error) { return reject(error); });
        })); };
    };
    return CrudInterface;
}());
exports.default = CrudInterface;
