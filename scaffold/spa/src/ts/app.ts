import $ from "jquery";
import popper from "popper.js";
import * as bootstrap from "bootstrap";
(window as any).$ = $;
(window as any).popper = popper;
(window as any).bootstrap = bootstrap;

// VueJS
import Vue from 'vue'
import VueI18n from "vue-i18n";
import VueRouter from 'vue-router';

Vue.use(VueRouter);
Vue.use(VueI18n);

import loading from "./utils/loading/loading.plugin";
import modal from "./utils/modal/modal.plugin";

// Index component
import { IndexComponent } from './components/';

Vue.use(loading);
Vue.use(modal);

// Router and store
import router from './router';
import { appStore as store } from './store';

import { i18n } from "./locale";

new Vue({
  el: '#app',
  render: h => h(IndexComponent),
  router,
  store,
  i18n
});