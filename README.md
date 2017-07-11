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
  // see examples below
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
`PathRouter` is similar to `HashRouter`, but has a `base` option. `base` defines the base path of the app.

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

For example, this is our root element:

```html
<div id="app">
  <router-view name="aside">
  <router-view />
</div>
```

The `<router-view>` is a functional component that renders the matched component.

It has a `name` property.  The default value is `default`.

Let's see the example routes definition:

```js
const routes = [
  // define which component will be mounted into <router-view name="aside">
  {
    name: 'aside',
    component: { /* component definition */ }
  },

  // the default <router-view>
  { path: '/basic', component: { /* component definition */ } },

  // return promise to define async components
  { path: '/async', component: () => import('./AsyncComponent.vue') },

  {
    path: '/prop',

    // pass some props to the component
    props: { foo: 'hello' },

    component: {
      props: ['foo'],
      // ...
    }
  },

  {
    // use : to define params
    path: '/article/:id',

    // props can be a factory function, it receives the current route object as the first argument.
    // see route object definition below to see what info can get.
    props: route => ({
      articleId: route.params.id,
      foo: route.query.get('foo'),
      bar: route.state.bar
    }),

    component: {
      props: ['articleId', 'foo', 'bar'],
      // ...
    }
  },

  {
    // path can be RegExp
    path: /^\/regex\/(\d+)$/,
    component: VFoo,
    // the subexpressions are stored as route.params.$1, route.params.$2, ...
    props: route => ({ foo: route.params.$1 })
  },

  // define hooks
  {
    path: '/login',

    // beforeEnter hook will be called before confirming the navigation.
    // arguments 'to' and 'from' are route objects.
    // return true or undefined/null to confirm the navigation
    // return URL string or location object to redirect
    // return false to abort the navigation
    // can return Promise
    beforeEnter(to, from) {

    },

    component: {
      // in-component beforeRouteLeave hook
      // will be called before route leave
      beforeRouteLeave(to, from) {

      },

      // ...
    }
  },


  // use Array to group <router-view> definitions
  [
    // in this group, this aside component will override the default aside <router-view> definition
    {
      name: 'aside',
      component: { /* ... */}
    },

    {
      // in this layout, the default <router-view> will mount a component that has nested <router-view>s
      component: {
        props: ['activeTab'],

        // define two child <router-view>s
        template: `
          <router-view />
          <router-view name="footer" />
        `
      },

      // route.meta is set by the matched route
      props: route => ({ activeTab: route.meta.activeTab })

      // define child <router-view>s
      children: [
        {
          path: '/foo',
          component: { /* ... */},

          // define some meta
          // then it can be passed to layout components as route.meta
          meta: { activeTab: 'foo' }
        },

        {
          path: '/bar',
          component: { /* ... */},

          // meta can be a factory function, the first argument is the current route object
          meta: route => ({ activeTab: route.query.get('active') })
        },

        // define a catch-all route
        // it must be put at the last of all routes definition
        {
          path: '*',
          component: {
            template: '<h1>404 Not Found</h1>'
          }
        }
      ]
    }
  ]
]
```

## The Route Object

```js
{
  path, // router internal path, which has stripped the protocol, host, and base path.
  query, // URLSearchParams object. https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
  hash,
  fullPath, // path + query + hash
  state, // state object
  params,
  meta
}
```

## The Location Object

```js
{
  path,
  query,
  hash,
  fullPath,
  state,
  hidden // Boolean. Indicate whether it is a hidden history entry. see history.push() for detail.
}
```

## &lt;router-link&gt;

The `<router-link>` is a navigation component, it usally renders an `<a>` element.

### Props

`to`: `Location` object, or `path`/`fullPath` of `Location` object.

`tag`: The HTML tag to render. Default: `<a>`.

`method`: `push`, `replace` or `dispatch`. Default: `push`.


## APIs
Mose of the APIs are proxied to [spa-history](https://github.com/fenivana/spa-history)

- [router.current](#routercurrent)
- [router.start(URL string | location)](#routerstarturl-string--location)
- [router.normalize(URL string | location)](#routernormalizeurl-string--location)
- [router.url(URL String | location)](#routerurlurl-string--location)
- [router.push(URL string | location)](#routerpushurl-string--location)
- [router.replace(URL string | location)](#routerreplaceurl-string--location)
- [router.dispatch(URL string | location)](#routerdispatchurl-string--location)
- [router.setState(state)](#routersetstatestate)
- [router.go(position, { silent = false, state = null } = {})](#routergoposition--silent--false-state--null---)
- [router.back(position, options)](#routerbackoptions)
- [router.forward(position, options)](#routerforwardoptions)
- [router.hookAnchorElements(container = document.body)](#routerhookanchorelementscontainer--documentbody)
- [router.beforeChange(callback)](#routerbeforeChangecallback)


### router.current
The current active route object.

### router.start(URL string | location)
Start the router.

In browser, if URL/location is not given, the default value is the current address. This argument is mainly for server-side rendering.

### router.normalize(URL string | location)
convert the URL string or unnormalized location object to normalized object

if URL/location.path is started with protocal, or `location.external` is `true`, `location.path` is treated as an external path, and will be converted to an internal path.

```js
// PathRouter with base '/foo/bar/'
router.normalize('http://www.example.com/foo/bar/home?a=1#b')
/*
  {
    path: '/home',
    query: new URLSearchParams('a=1'),
    hash: '#b',
    fullPath: '/home?a=1#b',
    state: {}
  }
*/

// same result as above
router.normalize({
  path: '/foo/bar/home?a=1#b',
  external: true
})

// same result as above
router.normalize('/home?a=1#b')

// same result as above
router.normalize({
  path: '/home',
  query: {
    a: 1
  },
  hash: '#b'
})

// HashRouter
// same result as above
router.normalize('http://www.example.com/app/#/home?a=1#b')
```

The `query` property can be of type Object, String and Array. see [URLSearchParams()](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams) for detail.

### router.url(URL string | location)
Convert the internal URL string or location object to an external URL which can be used in `href` attribute of `<a>`.

```js
router.url({
  path: '/home',
  query: {
    a: 1
  },
  hash: '#b'
})

// or
router.url('/home?a=1#b')

/*
  result:
  HashRouter: #/home?a=1#b
  PathRouter(with base: '/foo/bar/'): /foo/bar/home?a=1#b
*/
```

### router.push(URL string | location)
Counterpart of `window.history.pushState()`. Push the location onto the history stack. `beforeChange` will be called.

```js
router.push('/home?a=1#b')

router.push({
  path: '/home',
  query: {
    a: 1
  },
  hash: '#b'
})

// PathRouter, complete URL
router.push('http://www.example.com/foo/bar/home?a=1#b')

// HashRouter, complete URL
router.push('http://www.example.com/#/home?a=1#b')
```

You can push a location with state.

```js
router.push(
  path: '/home',
  state: {
    foo: 1,
    bar: 2
  }
)
```

And you can push a hidden location, which will not change the value of browser's address bar. the hidden location is stored in `window.history.state`

```js
router.push(
  path: '/login',
  state: {
    foo: 1
  },

  // '/login' won't show in the location bar
  hidden: true,

  // optional. if set, the location bar will show this address instead
  appearPath: '/buy'
)
```

### router.replace(URL string | location)
Counterpart of `window.history.replaceState()`. Replace the current history entry with the location.

### router.dispatch(URL string | location)
Dispatch the route without changing the history session.

### router.setState(state)
Set state of the current route. the state will be merged into `router.current.state`

### router.go(position, { silent = false, state = null } = {})
Counterpart of `window.history.go()`. Returns a promise which will be resolved when `popstate` event fired.

`silent`: if true, `beforeChange` won't be called.

`state`: if set, the state object will be merged into the state object of the destination location.

### router.back(options)
Same as `router.go(-1, options)`

### router.forward(options)
Same as `router.go(1, options)`

### router.captureLinkClickEvent(e)
Prevent the navigation when clicking the `<a>` element in the container and the `href` is an in-app address, `router.push()` will be called instead.

```html
<div @click="$router.captureLinkClickEvent($event)">
  <a href="/foo">foo</a>
</div>
```

### router.beforeChange(callback)
Add a global beforeChange callback. The callback will be called at initializing and before location change.


## Dependencies
- [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL)
- [Object.assign()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [Element.closest()](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest)

You can use <a href="http://babeljs.io/docs/usage/polyfill/">babel-polyfill</a> and <a href="https://github.com/WebReflection/dom4">dom4</a> to meet the requirements.

Or use the <a href="https://polyfill.io/">polyfill.io</a> service:
```html
<script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>
```

## Build
```
npm run build
```

## License
MIT
