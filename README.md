# vue-pilot
A vue router.

## Features
* Small (5kb gzipped).
* Manipulating history.state.
* Decoupling UI layout and URL structure.
* Dispatching route without changing URL.
* Typed query and params.

## Table of Contents
- [Constructor](#constructor)
  - [HashRouter](#hashrouter)
  - [PathRouter](#pathrouter)
- [Routes Definition](#routes-definition)
  - [&lt;router-view&gt;](#router-view)
  - [route table](#route-table)
- [Matched Route Object](#matched-route-object)
- [Location Object](#location-object)
- [&lt;router-link&gt;](#router-link)
- [APIs](#apis)
  - [router.current](#routercurrent)
  - [router.start](#routerstart)
  - [router.normalize](#routernormalize)
  - [router.url](#routerurl)
  - [router.push](#routerpush)
  - [router.replace](#routerreplace)
  - [router.dispatch](#routerdispatch)
  - [router.setState](#routersetstate)
  - [router.go](#routergo)
  - [router.back](#routerback)
  - [router.forward](#routerforward)
  - [router.captureLinkClickEvent](#routercapturelinkclickevent)
  - [router.beforeChange](#routerbeforechange)
  - [router.afterChange](#routerafterchange)
- [Dependencies](#dependencies)
- [License](#license)

## Constructor

### HashRouter

```js
import Vue from 'vue'
import { HashRouter } from 'vue-pilot'

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
import Vue from 'vue'
import { PathRouter } from 'vue-pilot'

Vue.use(PathRouter)

const routes = [
  //...
]

const router = new PathRouter({
  routes,

  // default: ''
  // If you want the root path doesn't contain ending slash,
  // you can set the base without ending slash, like '/app'
  base: '/app/'
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


### \<router-view>

```html
<router-view name="foo" />
```

The `<router-view>` is a functional component that renders the matched component.

It has a `name` property.  The default value is `default`.

### route table

Let's see the example routes definition:

```js
const routes = [
  {
    name: 'aside', // will be mounted into <router-view name="aside">
    component: { /* component definition */ }
  },

  {
    path: '/basic',

    // definition without `name`
    // the component will be mounted into <router-view name="default">
    component: { /* component definition */ }
  },

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
    // use `:key` to define params
    path: '/article/:id',

    // props can be a factory function, it receives the current route object as the first argument.
    props: route => ({
      articleId: route.params.int('id'),
      foo: route.query.string('foo'),
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
    // the subexpressions are stored as $1, $2, ...
    props: route => ({ foo: route.params.int('$1') })
  },

  // define hooks
  {
    path: '/login',

    // beforeEnter hook will be called before confirming the navigation.
    // see router.beforeChange below for details
    // Function | Array<Function>
    // `this` refers to the router instance.
    beforeEnter(to, from, action, router) {

    },

    component: {
      // in-component beforeRouteLeave hook
      // will be called before route leave
      // Function | Array<Function>
      // `this` refers to the vue component instance.
      beforeRouteLeave(to, from, action, router) {

      },

      // ...
    }
  },


  // use array to group <router-view> definitions
  // router view definitions in array will override outer definitions which has same name.
  [
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

      // define some meta
      meta: { activeTab: 'main' },

      // route.meta.activeTab is "foo" when path is "/foo"
      props: route => ({ activeTab: route.meta.activeTab })

      // define child <router-view>s
      children: [
        {
          name: 'footer',
          component: { /* ... */ }
        },

        {
          path: '/foo',
          component: { /* ... */ },

          // parent route meta and child route meta will be merged together
          // if child route meta has same keys as parent, it will override parent ones.
          meta: { activeTab: 'foo' }
        },

        [
          // override footer
          {
            name: 'footer',
            component: { /* ... */ }
          },

          {
            path: '/bar',
            component: { /* ... */},

            // meta can be a factory function
            meta: route => ({ activeTab: route.query.string('active') })
          }
        ],

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

## Matched Route Object
A route object contains the information of the matched route. It can be get from route hooks,
`router.beforeChange()`, `router.afterChange()`, `router.current`, etc.

```js
{
  path, // router internal path, which has stripped the protocol, host, and base path.
  query, // StringCaster object. https://github.com/jiangfengming/cast-string#stringcaster
  hash, // url hash
  fullPath, // path + query + hash

  // PathRouter: base + path + query + hash
  // HashRouter: '#' + path + query + hash
  url,

  state, // state object
  params, // StringCaster object. https://github.com/jiangfengming/cast-string#stringcaster
  meta // meta collected from route definition
}
```

`query` and `params` are [StringCaster](https://github.com/jiangfengming/cast-string#stringcaster) objects.

## Location Object
A location object is used for changing the current address. It can be used in `<router-link>`, `router.push()`, `router.replace()`, `router.dispatch()`, etc.

```js
{
  path,
  query,
  hash,
  fullPath,
  url,
  state,
  hidden // Boolean. Indicate whether it is a hidden history entry. see history.push() for detail.
}
```

## \<router-link>

```html
<router-link to="/list?page=1">List</router-link>
<router-link to="/home" target="_blank">Open new tab</router-link>
<router-link tag="div" action="replace" :to="{ path: '/category', query: { cat: 'shoes' }, state: { from: 'home' } }">Shoes</router-link>
<router-link to="https://www.example.com">external link</router-link>
```

The `<router-link>` is a navigation component, it normally renders an `<a>` element.

`to`: `Location` object, `path`/`fullPath` of `Location` object, or absolute URL.  
`action`: `String`. `push`, `replace`, or `dispatch`. Defaults to `push`.  
`tag`: `String`. The HTML tag name, defaults to `a`.

## APIs
Mose of the APIs are proxied to [spa-history](https://github.com/jiangfengming/spa-history).

In the vue instance, you can get the router object from `this.$router`.

### router.current
The current [matched route object](#matched-route-object).

### router.start

```js
router.start(URL string | location)
```

Start the router.

In browser, if URL/location is not given, the default value is the current address. This parameter is mainly for server-side rendering.

### router.normalize

```js
router.normalize(URL string | location)
```

convert the URL string or unnormalized location object to normalized object

if URL/location.path is started with protocal, or `location.external` is `true`, `location.path` is treated as an external path, and will be converted to an internal path.

```js
// PathRouter with base '/foo/bar/'
router.normalize('http://www.example.com/foo/bar/home?a=1#b')
/*
  {
    path: '/home',
    query: new StringCaster(new URLSearchParams('a=1')),
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

### router.url

```js
router.url(URL string | location)
```

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

### router.push

```js
router.push(URL string | location)
```

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
router.push({
  path: '/home',
  state: {
    foo: 1,
    bar: 2
  }
})
```

And you can push a hidden location, which will not change the value of browser's address bar. the hidden location is stored in `window.history.state`

```js
router.push({
  path: '/login',
  state: {
    foo: 1
  },

  // '/login' won't show in the location bar
  hidden: true,

  // optional. if set, the location bar will show this address instead
  appearPath: '/buy'
})
```

### router.replace

```js
router.replace(URL string | location)
```

Counterpart of `window.history.replaceState()`. Replace the current history entry with the location.

### router.dispatch

```
router.dispatch(URL string | location)
```

Dispatch the route without changing the history session. That is, the location of browser's address bar won't change.

### router.setState

```js
router.setState(state)
```

Set state of the current route. the state will be merged into `router.current.state`

### router.go

```js
router.go(position, { silent = false, state = null } = {})
```

Counterpart of `window.history.go()`. Returns a promise which will be resolved when `popstate` event fired.

`silent`: if true, `beforeChange` won't be called.

`state`: if set, the state object will be merged into the state object of the destination location.

### router.back

```js
router.back(options)
```

Alias of `router.go(-1, options)`

### router.forward

```js
router.forward(options)
```

Alias of `router.go(1, options)`

### router.captureLinkClickEvent

```js
router.captureLinkClickEvent(event)
```

Prevent the navigation when clicking the `<a>` element in the container and the `href` is an in-app address, `router.push()` will be called instead.

```html
<div @click="$router.captureLinkClickEvent($event)">
  <a href="/foo">foo</a>
</div>
```

### router.beforeChange

```js
router.beforeChange(function(to, from, action, router) {
  // ...
})
```

Add a global beforeChange callback. The callback will be called before confirming the navigation.
`this` of callback refers to the router instance.

```
Arguments:
  to: Route Object. The location will be changed to.
  from: Route Object. The current location.
  action:
    push: router.push() is called.
    replace: router.replace() is called.
    init: "to" is the initial page, at this stage, "from.path" is null.
    popstate: user clicked the back or foraward button , or router.go(), router.back(), router.forward() is called, or hash changed.
    dispatch: router.dispatch() is called.
  router: the router instance

Returns:
  true | undefined: The navigation is confirmed.
  false: Prevent the navigation.
  null: Do nothing.
  location: Redirect to this location.
            You can override the history manipulate action by providing location.action property, values are: 'push', 'replace', 'dispatch'.

Return value can be a Promise.
```

### router.afterChange

```js
router.afterChange(function(to, from, action, router) {
  // ...
})
```

Add a global afterChange callback. The callback will be called after history has been changed but before async components have been loaded.
`this` of callback refers to the router instance.

Returning `false` can prevent to load the new page.

## Dependencies
- [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL)
- [Object.assign()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [Element.closest()](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest)

You can use [@babel/polyfill](https://babeljs.io/docs/en/babel-polyfill/) and
[dom4](https://github.com/WebReflection/dom4) to meet the requirements.

Or use the [polyfill.io](https://polyfill.io/) service:
```html
<script src="https://polyfill.io/v3/polyfill.min.js"></script>
```

## License
[MIT](LICENSE)
