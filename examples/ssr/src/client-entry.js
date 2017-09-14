import Vue from 'vue'
import App from './App'
import createStore from './store'
import createRouter from './router'

const router = createRouter()
const store = createStore()

router.once('load', () => {
  new Vue({ ...App, router, store }).$mount('#app')
})
