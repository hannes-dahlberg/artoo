import Vue from 'vue';
import VueRouter, { NavigationGuard, Route, RawLocation } from 'vue-router'

//Types for vue router
export type nextLocationArg = RawLocation | false | ((vm: Vue) => any) | void;
export type nextLocation = (to?: nextLocationArg) => void;

/*These two functions help nest multiple middleware. Got it from:
https://github.com/vuejs/vue-router/issues/721#issuecomment-252181948
with credit to Johanderson Mogollon (https://github.com/sonic182)
*/
let operate = (guards: NavigationGuard[], from: Route, to: Route, lastNext: nextLocation, i: number) => {
    let guard = guards[i]
    if (guards.length === i + 1) {
        guard(from, to, lastNext)
    } else {
        guard(from, to, function (nextArg?: nextLocationArg): void {
            switch (typeof (nextArg)) {
                case 'undefined':
                    operate(guards, from, to, lastNext, i + 1)
                    break
                case 'object':
                    lastNext(nextArg)
                    break
                case 'boolean':
                    lastNext(nextArg)
                    break
                case 'string':
                    lastNext(nextArg)
                    break
            }
        })
    }
}
export let GuardsCheck = (ListOfGuards: NavigationGuard[]) => (from: Route, to: Route , next: nextLocation) => {
    operate(ListOfGuards, from, to, next, 0)
}