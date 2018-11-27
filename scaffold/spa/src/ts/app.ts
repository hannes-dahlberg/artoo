// VueJS
import Vue from 'vue'
import VueRouter from 'vue-router';
import * as Vuex from 'vuex';

// Index component
import { IndexComponent } from './components/';

Vue.use(VueRouter);
Vue.use(Vuex);

// Router and store
import router from './router';
// import store from './store'

new Vue({
  el: '#app',
  //store,
  render: h => h(IndexComponent),
  router
})
