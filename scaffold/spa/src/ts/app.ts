// VueJS
import Vue from 'vue'

// Index component
import Index from './components/index.vue'

// Router and store
import router from './router';
// import store from './store'

new Vue({
  el: '#app',
  //store,
  render: h => h(Index)
})
