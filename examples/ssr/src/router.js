import Vue from 'vue'
import Router from 'vue-stateful-router/PathRouter'

Vue.use(Router)

const routes = [
  {
    path: '/',
    component: () => import('./views/home'),
    meta: { ssr: true }
  },

  {
    path: '*',
    component: () => import('./views/404'),
    meta: { httpStatus: 404 }
  }
]

export default function() {
  return new Router({ routes })
}
