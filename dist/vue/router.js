"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var operate = function (guards, from, to, lastNext, i) {
    var guard = guards[i];
    if (guards.length === i + 1) {
        guard(from, to, lastNext);
    }
    else {
        guard(from, to, function (nextArg) {
            switch (typeof (nextArg)) {
                case 'undefined':
                    operate(guards, from, to, lastNext, i + 1);
                    break;
                case 'object':
                    lastNext(nextArg);
                    break;
                case 'boolean':
                    lastNext(nextArg);
                    break;
                case 'string':
                    lastNext(nextArg);
                    break;
            }
        });
    }
};
exports.GuardsCheck = function (ListOfGuards) { return function (from, to, next) {
    operate(ListOfGuards, from, to, next, 0);
}; };
