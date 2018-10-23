"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Singleton = (function () {
    function Singleton() {
    }
    Singleton.getInstance = function () { return this.instance || (this.instance = new this()); };
    return Singleton;
}());
exports.Singleton = Singleton;
