"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
exports.setAuth = function (store) { return function (to, from, next) {
    if (store.getters.isAuth && !axios_1.default.defaults.headers.common['Authorization']) {
        axios_1.default.defaults.headers.common['Authorization'] = 'Bearer ' + store.getters.getToken;
        axios_1.default.defaults.withCredentials = true;
    }
    else if (!store.getters.isAuth && axios_1.default.defaults.headers.common['Authorization'] !== undefined) {
        delete axios_1.default.defaults.headers.common['Authorization'];
        axios_1.default.defaults.withCredentials = false;
    }
    next();
}; };
