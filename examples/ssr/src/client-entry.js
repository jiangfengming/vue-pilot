import Vue from 'vue'
import App from './App'
import createStore from './store'
import createRouter from './router'

if (window.__INITIAL_VUEX_STATE__) store.replaceState(window.__INITIAL_VUEX_STATE__)

const router = createRouter()
const store = createStore()

const app = new Vue({
  extends: App
})

router.onReady(() => app.$mount('#app'))
