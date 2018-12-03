import { Module, MutationTree, ActionTree, GetterTree } from 'vuex';

import appStore from './app.store';
import { AppState } from './app.store';
import { broadcast } from '../utils/broadcast';

export type errorPayload = { code?: number, message?: string, error?: any }
export type submitActionCallback = (payload: errorPayload) => Promise<void>;
export type subscribeActionPayload = (payload: errorPayload) => void;
export type subscribeActionCallback = (callback: subscribeActionPayload) => Promise<void>;

export interface ErrorState { }

export const errorStore: Module<ErrorState, AppState> = {
  namespaced: true,
  actions: <ActionTree<ErrorState, AppState>>{
    submit: ({ }, payload: errorPayload) => {
      broadcast.emit('error', payload);
    },
    subscribe: ({ }, callback: subscribeActionPayload) => {
      broadcast.subscribe('error').then((payload: errorPayload) => callback(payload));
    }
  }
}