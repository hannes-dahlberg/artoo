import { ActionTree, GetterTree, Module, MutationTree } from "vuex";

import { broadcast } from "../utils/broadcast";
import { IAppState } from "./app.store";

export interface IErrorPayload { code?: number; message?: string; error?: any; }
export type submitActionCallback = (payload: IErrorPayload) => Promise<void>;
export type subscribeActionPayload = (payload: IErrorPayload) => void;
export type subscribeActionCallback = (callback: subscribeActionPayload) => Promise<void>;

export interface IErrorState { } // tslint:disable-line:no-empty-interface

export const errorStore: Module<IErrorState, IAppState> = {
  namespaced: true,
  actions: {
    submit: ({ }, payload: IErrorPayload) => {
      broadcast.emit("error", payload);
    },
    subscribe: ({ }, callback: subscribeActionPayload) => {
      broadcast.subscribe("error").then((payload: IErrorPayload) => callback(payload));
    },
  } as ActionTree<IErrorState, IAppState>,
};
