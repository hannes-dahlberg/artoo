import Vue from 'vue';
import { NavigationGuard, Route, RawLocation } from 'vue-router';
export declare type nextLocationArg = RawLocation | false | ((vm: Vue) => any) | void;
export declare type nextLocation = (to?: nextLocationArg) => void;
export declare let GuardsCheck: (ListOfGuards: NavigationGuard[]) => (from: Route, to: Route, next: nextLocation) => void;
