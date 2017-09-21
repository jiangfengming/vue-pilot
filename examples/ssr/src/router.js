import Vue from 'vue'
import Router from 'vue-stateful-router/PathRouter'

Vue.use(Router)

const routes = [
  {
    path: '/',
    component: () => import('./views/Index'),
    meta: { ssr: true }
  },

  {
    path: '/articles/:id',
    component: () => import('./views/Article'),
    props: ({ params }) => ({ id: params.id })
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
