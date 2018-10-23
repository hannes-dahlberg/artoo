"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
Promise.config({
    cancellation: true
});
var Mode;
(function (Mode) {
    Mode[Mode["recursive"] = 0] = "recursive";
    Mode[Mode["simultaneous"] = 1] = "simultaneous";
})(Mode = exports.Mode || (exports.Mode = {}));
var Prom = (function () {
    function Prom() {
    }
    Prom.sequence = function (promises, _a) {
        if (promises === void 0) { promises = []; }
        var _b = _a === void 0 ? {} : _a, _c = _b.mode, mode = _c === void 0 ? Mode.recursive : _c, _d = _b.breakOnResolve, breakOnResolve = _d === void 0 ? false : _d, _e = _b.breakOnReject, breakOnReject = _e === void 0 ? false : _e, _f = _b.output, output = _f === void 0 ? { results: [], resolves: 0, rejects: 0 } : _f;
        return new Promise(function (resolve, reject, onCancel) {
            if (mode == Mode.recursive) {
                var nextProm = function () {
                    promises.splice(0, 1);
                    if (promises.length) {
                        var promise = Prom.sequence(promises, { mode: mode, breakOnResolve: breakOnResolve, breakOnReject: breakOnReject, output: output }).then(function (result) { return resolve(output); });
                        onCancel(function () { return promise.cancel(); });
                    }
                    else {
                        resolve(output);
                    }
                };
                if (!promises[0]) {
                    nextProm();
                    return;
                }
                var promise = promises[0]().then(function (result) {
                    output.results.push({ result: result });
                    output.resolves++;
                    if (breakOnResolve) {
                        resolve(output);
                        return;
                    }
                    nextProm();
                }).catch(function (error) {
                    output.results.push({ error: error });
                    output.rejects++;
                    if (breakOnReject) {
                        resolve(output);
                        return;
                    }
                    nextProm();
                });
                onCancel(function () { return promise.cancel(); });
            }
            else if (mode == Mode.simultaneous) {
                for (var a = 0; a < promises.length; a++) {
                    output.results.push({});
                }
                var executedPromises = [];
                onCancel(function () { return executedPromises.forEach(function (promise) { return promise.cancel(); }); });
                var end = function () {
                    var numberOfExecutedPromises = output.resolves + output.rejects;
                    var numberOfPromises = promises.filter(function (promise) { return promise; }).length;
                    if (numberOfExecutedPromises == numberOfPromises) {
                        resolve(output);
                        return;
                    }
                    if ((breakOnResolve && output.resolves > 0) || breakOnReject && output.rejects > 0) {
                        if (numberOfExecutedPromises < numberOfPromises) {
                            executedPromises.forEach(function (promise) { return promise.cancel(); });
                        }
                        resolve(output);
                    }
                };
                promises.forEach(function (promise, index) {
                    if (!promise) {
                        return;
                    }
                    executedPromises.push(promise().then(function (result) {
                        output.results[index].result = result;
                        output.resolves++;
                        end();
                    }).catch(function (error) {
                        output.results[index].error = error;
                        output.rejects++;
                        end();
                    }));
                });
            }
        });
    };
    Prom.wait = function (wait) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve();
            }, wait);
        });
    };
    Prom.and = function (promises, mode) {
        if (mode === void 0) { mode = Mode.recursive; }
        return new Promise(function (resolve, reject) {
            Prom.sequence(promises, { mode: mode, breakOnReject: true }).then(function (result) {
                if (!result.errors.length) {
                    resolve(result);
                }
                else {
                    reject(result);
                }
            });
        });
    };
    Prom.or = function (promises, mode) {
        if (mode === void 0) { mode = Mode.recursive; }
        return new Promise(function (resolve, reject) {
            Prom.sequence(promises, { mode: mode }).then(function (result) {
                if (result.results.find(function (result) { return result != null; })) {
                    resolve(result);
                }
                else {
                    reject(result);
                }
            });
        });
    };
    return Prom;
}());
exports.Prom = Prom;
