import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";
import createPersistedState from "vuex-persistedstate";

import { authStore } from "./auth.store";
import { errorStore } from "./error.store";

const MODULES = {
  auth: authStore,
  error: errorStore,
};

export interface IAppState { }

Vue.use(Vuex);

export const appStore = new Vuex.Store<IAppState>({
  modules: { ...MODULES },
  plugins: [createPersistedState()],
  state: {},
});
