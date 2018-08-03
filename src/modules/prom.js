"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
//Setting bluebird config
Promise.config({
    cancellation: true
});
var Mode;
(function (Mode) {
    Mode[Mode["recursive"] = 0] = "recursive";
    Mode[Mode["simultaneous"] = 1] = "simultaneous";
})(Mode = exports.Mode || (exports.Mode = {}));
var Prom = /** @class */ (function () {
    function Prom() {
    }
    Prom.sequence = function (promises, _a) {
        if (promises === void 0) { promises = []; }
        var _b = _a === void 0 ? {} : _a, _c = _b.mode, mode = _c === void 0 ? Mode.recursive : _c, _d = _b.breakOnResolve, breakOnResolve = _d === void 0 ? false : _d, _e = _b.breakOnReject, breakOnReject = _e === void 0 ? false : _e, _f = _b.output, output = _f === void 0 ? { results: [], resolves: 0, rejects: 0 } : _f;
        return new Promise(function (resolve, reject, onCancel) {
            /*Recursive mode execute each promise in order. Next promise is not
            executed before the previous one has resolved (or rejected)*/
            if (mode == Mode.recursive) {
                //Method for making the next promise
                var nextProm = function () {
                    //Remove the previous executed promise from array
                    promises.splice(0, 1);
                    /*If the array still has promises. Call itself with the
                    spliced promise array*/
                    if (promises.length) {
                        //Execute and resolve output
                        var promise = Prom.sequence(promises, { mode: mode, breakOnResolve: breakOnResolve, breakOnReject: breakOnReject, output: output }).then(function (result) { return resolve(output); });
                        //Chaining down onCancel emitter
                        onCancel(function () { return promise.cancel(); });
                    }
                    else {
                        //Promise array is empty. Resolve the output
                        resolve(output);
                    }
                };
                //If promise is not set simply call the next promise
                if (!promises[0]) {
                    nextProm();
                    return;
                }
                //Execute promise
                var promise = promises[0]().then(function (result) {
                    //Add result to output
                    output.results.push({ result: result });
                    output.resolves++;
                    //Resolve if breakOnResolve is true
                    if (breakOnResolve) {
                        resolve(output);
                        return;
                    }
                    //Execute next promise
                    nextProm();
                }).catch(function (error) {
                    //Add error to output
                    output.results.push({ error: error });
                    output.rejects++;
                    //Resolve if breakOnReject is true
                    if (breakOnReject) {
                        resolve(output);
                        return;
                    }
                    //Execute next promise
                    nextProm();
                });
                //Cancel the current promise if onCancel is emitted
                onCancel(function () { return promise.cancel(); });
                /*Simultaneous mode execute all promises at the same time. Great for
                when resolving on first resolve or reject of any promise*/
            }
            else if (mode == Mode.simultaneous) {
                /*Creates an empty array for all output results. If it would
                push each result as it resolves/rejects they might not be in
                the same order as the provided promise array. This makes sure
                that the index of a promise in the promise array has its result
                on the same index in the results/errors array*/
                for (var a = 0; a < promises.length; a++) {
                    output.results.push({});
                }
                /*Container for all executed promises. Used for when sequence
                need to halt and end each promise already initiated*/
                var executedPromises = [];
                //Handler for onCancel event
                onCancel(function () { return executedPromises.forEach(function (promise) { return promise.cancel(); }); });
                //Method to detect when to end the sequence and resolve
                var end = function () {
                    //Number of executed promises (resolved and rejected)
                    var numberOfExecutedPromises = output.resolves + output.rejects;
                    var numberOfPromises = promises.filter(function (promise) { return promise; }).length;
                    //All promises has resolved or rejected, resolve output
                    if (numberOfExecutedPromises == numberOfPromises) {
                        resolve(output);
                        return;
                    }
                    //If sequence should break on either first resolve or reject
                    if ((breakOnResolve && output.resolves > 0) || breakOnReject && output.rejects > 0) {
                        //Is there any promise still yet to be executed?
                        if (numberOfExecutedPromises < numberOfPromises) {
                            //call cancel on any remaining promise
                            executedPromises.forEach(function (promise) { return promise.cancel(); });
                        }
                        //Resolve output
                        resolve(output);
                    }
                };
                //Loop through each promise
                promises.forEach(function (promise, index) {
                    /*No promise just resolves (when providing null
                    in the array of promises)*/
                    if (!promise) {
                        return;
                    }
                    /*Execute promise and replace it in the array by its call
                    return. For it to be possible to cancel later*/
                    executedPromises.push(promise().then(function (result) {
                        //Add result and call end
                        output.results[index].result = result;
                        output.resolves++;
                        end();
                    }).catch(function (error) {
                        //Add result and call end
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
            //Execute all promises but break on first rejection
            Prom.sequence(promises, { mode: mode, breakOnReject: true }).then(function (result) {
                //If no promise was rejected resolve the result
                if (!result.errors.length) {
                    resolve(result);
                }
                else { /*At least on promise was rejected, therefore the
                            the method itself will also reject*/
                    reject(result);
                }
            });
        });
    };
    Prom.or = function (promises, mode) {
        if (mode === void 0) { mode = Mode.recursive; }
        return new Promise(function (resolve, reject) {
            //Execute all promises
            Prom.sequence(promises, { mode: mode }).then(function (result) {
                /*If any of the promises resolved the method will resolve as
                well*/
                if (result.results.find(function (result) { return result != null; })) {
                    resolve(result);
                }
                else {
                    //Reject if all promises rejected
                    reject(result);
                }
            });
        });
    };
    return Prom;
}());
exports.Prom = Prom;
