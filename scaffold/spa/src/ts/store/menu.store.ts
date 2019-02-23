import { RawLocation } from "vue-router";
import { GetterTree, Module } from "vuex";

import { TranslateResult } from "vue-i18n";
import { i18n } from "../locale";
import { IAppState } from "./app.store";

export interface IMenuItem { route?: RawLocation; title: TranslateResult; menu?: IMenuItem[]; alignRight?: boolean; }
export interface IMenuState { } // tslint:disable-line:no-empty-interface

export const menuStore: Module<IMenuState, IAppState> = {
  getters: {
    menu: (state, getters): IMenuItem[] => {
      return [
        ...getters["auth/isAuth"] ? [
          { route: { name: "logout" }, title: i18n.t("menu.logout"), alignRight: true },
        ] : [
            { route: { name: "login" }, title: i18n.t("menu.login"), alignRight: true },
          ],
      ];
    },
  } as GetterTree<IMenuState, IAppState>,
};
