import { Module, MutationTree, ActionTree, GetterTree } from 'vuex';
import { default as Axios, AxiosResponse } from "axios";

import { AppState } from './app.store';
import { errorPayload } from './error.store';

export const apiPath: string = `http://${process.env.API_HOST}:${process.env.PORT}`;


export interface AuthState {
  token: string | null;
  user: User;
}

export interface User {
  id: number,
  email: string
}

export type loginActionPayload = { email: string, password: string };
export type loginActionCallback = (payload: loginActionPayload) => Promise<void>;

export const authStore: Module<AuthState, AppState> = {
  namespaced: true,
  state: <AuthState>{
    token: null,
    user: null
  },
  mutations: <MutationTree<AuthState>>{
    setToken: (state, payload: string) => {
      state.token = payload;
    },
    setUser: (state, payload: User) => {
      state.user = payload;
    }
  },
  actions: <ActionTree<AuthState, AppState>>{
    login: ({ commit, dispatch }, payload: loginActionPayload) => {
      Axios.post(`${apiPath}/auth/login`, payload).then((response: AxiosResponse) => {
        commit('setToken', response.data.token);
        commit('setUser', response.data.user);
      }).catch((error: any) => dispatch('error/submit', { message: 'Something went wrong', error }, { root: true }));
    }
  },
  getters: <GetterTree<AuthState, AppState>>{
    token: (state): string => {
      return state.token;
    },
    user: (state): User => {
      return state.user;
    },
    isAuth: (state): boolean => {
      return !!state.user;
    }
  }
}