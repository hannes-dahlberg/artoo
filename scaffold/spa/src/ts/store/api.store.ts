import { AxiosResponse, default as Axios } from "axios";
import { ActionTree, GetterTree, Module, MutationTree } from "vuex";

import { IAppState } from "./app.store";

export interface IAPIState {
  baseUrl: string | null;
}

export const apiStore: Module<IAPIState, IAppState> = {
  actions: {
    getBaseUrl: ({ commit, dispatch }): Promise<void> => {
      return new Promise((resolve, reject) => {
        Axios.head(`/api_base_url`).then((response: AxiosResponse) => {
          if (response.headers.api_base_url) {
            commit("setBaseUrl", `${location.protocol}//${response.headers.api_base_url}${location.port !== "" ? `:${location.port}` : ""}`);
            dispatch("setAxiosBaseUrl");
            resolve();
          } else {
            dispatch("error/submit", { message: "API base URL was missing from header" }, { root: true });
            reject();
          }
        }).catch((error: any) => {
          dispatch("error/submit", { message: "Trying to get the API base URL failed", error }, { root: true });
          reject();
        });
      });
    },
    setAxiosBaseUrl: ({ getters }): void => {
      Axios.defaults.baseURL = getters.baseUrl;
    },
  } as ActionTree<IAPIState, IAppState>,
  getters: {
    baseUrl: (state): string => {
      return `${state.baseUrl !== null ? state.baseUrl : ""}/`;
    },
  } as GetterTree<IAPIState, IAppState>,
  mutations: {
    setBaseUrl: (state, payload: string) => {
      state.baseUrl = payload;
    },
  } as MutationTree<IAPIState>,
  namespaced: true,
  state: {
    baseUrl: null,
  } as IAPIState,
};
