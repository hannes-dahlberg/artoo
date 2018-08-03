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
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var _ = require("lodash");
var BluebirdPromise = require("bluebird");
exports.toJson = function (object) {
    return JSON.parse(JSON.stringify(object));
};
exports.hash = function (plainText) {
    return bcrypt.hashSync(plainText, 10);
};
exports.hashCheck = function (plainText, hash) {
    return bcrypt.compareSync(plainText, hash);
};
exports.signJwt = function (payload) {
    return jwt.sign(payload, 'EBdVaKyseI');
};
exports.decodeJwt = function (token) {
    return jwt.verify(token, 'EBdVaKyseI');
};
exports.verifyJwt = function (token) {
    return !!exports.decodeJwt(token);
};
exports.dateFormat = function (date) {
    if (!date) {
        date = new Date();
    }
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    return year.toString() +
        (month < 10 ? '0' + month.toString() : month.toString()) +
        (day < 10 ? '0' + day.toString() : day.toString()) +
        '_' +
        (hour < 10 ? '0' + hour.toString() : hour.toString()) +
        (minute < 10 ? '0' + minute.toString() : minute.toString()) +
        (second < 10 ? '0' + second.toString() : second.toString());
};
exports.substr = function (input, start, end) {
    if (start === undefined) {
        start = 0;
    }
    if (end === undefined) {
        end = input.length;
    }
    if (start < 0) {
        start = input.length + start;
    }
    if (start < 0) {
        start = 0;
    }
    if (end >= 0) {
        end = start + end;
    }
    if (end < 0) {
        end = input.length + end;
    }
    if (end < 0) {
        end = 0;
    }
    return input.substring(start, end);
};
exports.ucFirst = function (value) {
    return value.slice(0, 1).toUpperCase() + value.slice(1, value.length);
};
exports.groupBy = function (objects, keys) {
    //If keys is a string convert it to array
    if (typeof keys == 'string') {
        keys = [keys];
    }
    //Creating a hash to work as key to group by
    var hashKey = (new Date()).getTime().toString() + (Math.floor(Math.random() * 10) + 1).toString();
    var groups = _.groupBy(objects.map(function (object) {
        var _a;
        return __assign((_a = {}, _a[hashKey] = keys.map(function (key) { return object[key]; }).join(''), _a), object);
        //Group by hash key
    }), hashKey);
    return Object.keys(groups).map(function (groupKey) {
        var object = {};
        /*Add each key from the first row in the group with
        a value in the keys array*/
        keys.forEach(function (key) { return object[key] = groups[groupKey][0][key]; });
        //Declare placholder for the rest of the values
        object['_rows'] = [];
        //Walk through each row in the group
        groups[groupKey].forEach(function (row) {
            //Create temp container object
            var tempRow = {};
            Object.keys(row).filter(function (key) { return [hashKey].concat(keys).indexOf(key) == -1; }).forEach(function (key) {
                /*Add each value in the array with a key value NOT
                part of the keys array*/
                tempRow[key] = row[key];
            });
            //Push the temp container to _rows
            object['_rows'].push(tempRow);
        });
        //Return new object
        return object;
    });
};
exports.unique = function (array) {
    var returnArray = [];
    array.forEach(function (item) {
        if (returnArray.indexOf(item) == -1) {
            returnArray.push(item);
        }
    });
    return returnArray;
};
exports.isValidDate = function (date) {
    return date instanceof Date && !isNaN(date);
};
exports.promiseToBluebird = function (promise) {
    return new BluebirdPromise(function (resolve, reject) { return promise.then(function (result) { return resolve(result); }).catch(function (error) { return reject(error); }); });
};
