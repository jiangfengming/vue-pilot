import Router from 'vue-stateful-router/PathRouter'

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

router.start()

export default router
