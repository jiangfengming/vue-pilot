import Router from '../../../PathRouter'

const router = new Router({
  routes: [
    {
      component: () => import('./views/LayoutA'),
      children: [
        {
          path: '/',
          component: () => import('./views/Index')
        }
      ]
    }
  ]
})

export default router
