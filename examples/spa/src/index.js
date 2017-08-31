import Vue from 'vue'
import PathRouter from 'vue-stateful-router/PathRouter'
import App from './App'

Vue.use(PathRouter)

new Vue(App).$mount('#app')
