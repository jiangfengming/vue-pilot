# vue-stateful-router
A vue router with the power of history.state

## Constructor

### HashRouter

```js
import Vue from 'vue'
import HashRouter from 'vue-stateful-router/HashRouter'

Vue.use(HashRouter)

// define routes
const routes = [
  // see below for examples.
]

const router = new HashRouter({ routes })

const app = new Vue({
  router,
  template: `
    <div id="app">
      <router-view />
    </div>
  `,
  // ...
}).$mount()

document.body.appendChild(app.$el)
router.start()
```

### PathRouter
`PathRouter` is similar to `HashRouter`, but has a `base` option when initializing.

```js
import PathRouter from 'vue-stateful-router/PathRouter'
```

```js
const router = new PathRouter({
  routes,
  base: '/app/' // default: '/'
})
```

## Routes Definition


```js
const routes = [
  { path: '/basic', component: { /* component definition */ } },

  // support async components
  // https://vuejs.org/v2/guide/components.html#Async-Components
  { path: '/async', component: () => import('./AsyncComponent.vue') },


  // pass some props to component
  {
    path: '/prop',

    component: {
      props: ['foo'],
      // ...
    },

    props: { foo: 'hello' }
  },


  // pass query to props
  {
    path: '/search',

    component: {
      props: ['search'],
      // ...
    },

    // props can be a factory function, so that we can set dynamic values.
    // the function receive the current route object as the first argument.
    // see route object below for detail.
    // route.query is type of URLSearchParams
    // https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
    props: route => ({ search: route.query.get('s') })
  },


  // pass params to props
  {
    path: '/article/:id',

    component: {
      props: ['articleId'],
      // ...
    },

    props: route => ({ articleId: route.params.id })
  }


  // layout definition
  {
    layout: {
      /*
        let's say, the root Vue component is:

        <div id="app">
          <router-view />
        </div>

        define the <router-view> as a layout component
      */
      default: {
        component: {
          props: ['activeTab'],

          // define two child router views
          template: `
            <router-view />
            <router-view name="footer" />
          `
        },

        // pass some props to the component
        // we can use route.meta to receive variables set by dynamic components
        props: route => ({ activeTab: route.meta.activeTab })

        children: {
          // use array to define the default router-view as a dynamic component
          default: [
            {
              path: '/layout/foo',
              component: { /* ... */},

              // define some meta info
              // then can be passed to layout components
              meta: { activeTab: 'foo' }
            },


            {
              path: '/layout/bar',
              component: { /* ... */},

              // meta can be a factory function, the first argument is the current route object
              meta: route => ({ activeTab: route.query.get('active') })
            }
          ],

          // the 'footer' router-view
          footer: {
            component: { /* ... */ }
          }
        }
      }
    }
  },


  // hooks
  {
    path: '/login',

    // will be called before confirming the navigation.
    // arguments 'to' and 'from' are route objects.
    // return true of undefined/null to confirm the navigation
    //
    beforeEnter(to, from) {

    },

    component: {
      //
      beforeRouteLeave() {

      },

      // ...
    }
  }
]
```

## The Route Object

```js
{
  path,
  query,
  hash,
  fullPath,
  params,
  meta
}
```

## <router-view>

## <router-link>

## APIs

## Build
```
npm run build
```

## License
MIT
