import Router from 'vue-stateful-router/PathRouter'

const router = new Router({
  routes: [
    {
      component: () => import('./views/Layout'),
      children: [
        {
          path: '/',
          component: () => import('./views/Index')
        },

        {
          component: () => import('./views/child-views/Layout'),
          children: [
            {
              path: '/child-views',
              component: () => import('./views/child-views/Main'),
              children: [
                {
                  component: () => import('./views/child-views/MainChild')
                }
              ]
            },

            {
              name: 'secondary',
              component: () => import('./views/child-views/Secondary'),
              children: [
                {
                  component: () => import('./views/child-views/SecondaryChild')
                }
              ]
            }
          ]
        }
      ]
    }
  ]
})

router.start()

export default router
