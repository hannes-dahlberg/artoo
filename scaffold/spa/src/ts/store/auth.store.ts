import { AxiosResponse, default as Axios } from "axios";
import { ActionTree, GetterTree, Module, MutationTree } from "vuex";
import { broadcast } from "../utils/broadcast";

import { IAppState } from "./app.store";

export const apiPath: string = `http://${process.env.API_HOST}:${process.env.PORT}`;

export interface IAuthState {
  token: string | null;
  user: IUSer | null;
}

export interface IUSer {
  id: number;
  email: string;
}

export interface IloginActionPayload { email: string; password: string; }
export type loginActionCallback = (payload: IloginActionPayload) => Promise<void>;

export const authStore: Module<IAuthState, IAppState> = {
  actions: {
    login: ({ commit, dispatch }, payload: IloginActionPayload): Promise<void> => {
      return new Promise((resolve, reject) => {
        Axios.post(`${apiPath}/auth/login`, payload).then((response: AxiosResponse) => {
          commit("setToken", response.data.token);
          commit("setUser", response.data.user);
          dispatch("setAxiosHeaders", response.data.token);
          resolve();
        }).catch((error: any) => dispatch("error/submit", { message: "Something went wrong", error }, { root: true }));
      });
    },
    logout: ({ commit, dispatch }): void => {
      commit("removeToken");
      commit("removeUser");
      dispatch("removeAxiosHeaders");
      broadcast.emit("logout");
    },
    setAxiosHeaders: ({ getters }): void => {
      if (getters.token) {
        Axios.defaults.headers.Authorization = `Bearer: ${getters.token}`;
      }
    },
    removeAxiosHeaders: (): void => {
      delete Axios.defaults.headers.Authorization;
    },
    setAxiosInterceptors: ({ dispatch }): void => {
      Axios.interceptors.response.use((response) => {
        return response
      },
        (error) => {
          // Unauthorized
          if (error.response.status == 401) {
            dispatch("logout");
          }
          return Promise.reject(error);
        });
    }
  } as ActionTree<IAuthState, IAppState>,
  getters: {
    isAuth: (state): boolean => {
      return !!state.user;
    },
    token: (state): string => {
      return state.token;
    },
    user: (state): IUSer => {
      return state.user;
    },
  } as GetterTree<IAuthState, IAppState>,
  mutations: {
    setToken: (state, payload: string) => {
      state.token = payload;
    },
    removeToken: (state) => {
      state.token = null;
    },
    setUser: (state, payload: IUSer) => {
      state.user = payload;
    },
    removeUser: (state) => {
      state.user = null;
    }
  } as MutationTree<IAuthState>,
  namespaced: true,
  state: {
    token: null,
    user: null,
  } as IAuthState,
};
