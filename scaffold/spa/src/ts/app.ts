import Vue from 'vue'
import App from './vue/index.vue'
//import store from './store'

const vue = new Vue({
  el: '#app',
  //store,
  render: h => h(App)
})
