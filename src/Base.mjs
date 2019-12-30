import URLRouter from 'url-router'
import RouterView from './RouterView'
import RouterLink from './RouterLink'
import { StringCaster } from 'cast-string'

export default class Base {
  static install(Vue) {
    Vue.component('router-view', RouterView)
    Vue.component('router-link', RouterLink)

    Vue.config.optionMergeStrategies.beforeRouteLeave = (parent, child) =>
      child ? (parent || []).concat(child) : parent

    Vue.mixin({
      beforeCreate() {
        const router = this.$options.router || (this.$parent && this.$parent.$router)

        if (!router) {
          return
        }

        this.$router = router

        if (this.$root === this && !router._observed) {
          router.current = Vue.observable(router.current)
          router._observed = true
        }
      },

      mounted() {
        if (
          this.$router &&
          this.$vnode && // root vm's $vnode is undefined
          this.$vnode.data._routerView &&
          this.$vnode.data._routerView.path &&
          this.$options.beforeRouteLeave
        ) {
          this.$router._hooks.beforeRouteLeave = this.$options.beforeRouteLeave.map(f => f.bind(this))
        }
      },

      beforeDestroy() {
        if (
          this.$router &&
          this.$vnode &&
          this.$vnode.data._routerView &&
          this.$vnode.data._routerView.path &&
          this.$options.beforeRouteLeave
        ) {
          this.$router._hooks.beforeRouteLeave = []
        }
      }
    })
  }

  constructor({ origin, routes }) {
    const locationOrigin = typeof window === 'object' && window.location && window.location.origin
    this.origin = [].concat(locationOrigin || [], origin || [])
    this._routes = this._parseRoutes(routes)
    this._urlRouter = new URLRouter(this._routes)

    this._hooks = {
      beforeChange: [],
      beforeChangeOnce: [],
      beforeUpdate: [],
      beforeUpdateOnce: [],
      afterChange: [],
      afterChangeOnce: [],
      beforeRouteEnter: [],
      beforeRouteLeave: []
    }

    this.current = {
      path: null,
      fullPath: null,
      url: null,
      query: null,
      hash: null,
      state: null,
      params: null,
      meta: null
    }
  }

  _parseRoutes(routerViews, siblings = [], layers = [], parsed = []) {
    const sib = routerViews.filter(v => !(v instanceof Array) && !v.path)
    const names = sib.map(v => v.name)

    // router views in same array has higher priority than outer ones
    siblings = siblings.filter(v => !names.includes(v.name)).concat(sib)

    routerViews.forEach(routerView => {
      if (routerView instanceof Array) {
        this._parseRoutes(routerView, siblings, layers, parsed)
      } else {
        const layer = siblings.filter(v => v.name !== routerView.name).concat(routerView)
        const _layers = layers.concat([layer])

        if (routerView.children) {
          this._parseRoutes(routerView.children, [], _layers, parsed)
        } else if (routerView.path) {
          parsed.push([routerView.path, _layers])
        }
      }
    })

    return parsed
  }

  setState(state) {
    this._history.setState(state)

    // Vue can not react if add new props into an existing object
    // so we replace it with a new state object
    this.current.state = Object.assign({}, this._history.current.state)

    // meta factory function may use state object to generate meta object
    // so we need to re-generate a new meta
    this._generateMeta(this.current)
  }

  on(event, fn, { once, beginning } = {}) {
    if (once) {
      event += 'Once'
    }

    if (beginning) {
      this._hooks[event].unshift(fn)
    } else {
      this._hooks[event].push(fn)
    }
  }

  off(event, fn, { once } = {}) {
    if (once) {
      event += 'Once'
    }

    this._hooks[event] = this._hooks[event].filter(f => f !== fn)
  }

  _beforeChange(to, from, action) {
    const route = to.route = {
      path: to.path,
      fullPath: to.fullPath,
      url: to.url,
      query: to.query,
      hash: to.hash,
      state: to.state,
      meta: {},
      params: null,
      _routerViews: null,
      _meta: []
    }

    const _route = this._urlRouter.find(to.path)

    if (_route) {
      this._resolveRoute(route, _route)
    }

    const hooks = this._hooks.beforeRouteLeave.concat(
      this._hooks.beforeRouteEnter,
      this._hooks.beforeChangeOnce.map(fn => fn.bind(this)),
      this._hooks.beforeChange.map(fn => fn.bind(this))
    )

    if (!hooks.length) {
      return true
    }

    this._hooks.beforeChangeOnce = []
    let promise = Promise.resolve(true)

    hooks.forEach(hook =>
      promise = promise.then(() =>
        Promise.resolve(hook(route, this.current, action, this)).then(result => {
          // if the hook abort or redirect the navigation, cancel the promise chain.
          if (result !== undefined && result !== true) {
            throw result
          }
        })
      )
    )

    return promise.catch(e => {
      if (e instanceof Error) {
        // encountered unexpected error
        throw e
      } else {
        // abort or redirect
        return e
      }
    })
  }

  _resolveRoute(to, _route) {
    to.params = new StringCaster(_route.params)

    const root = {}
    let routerView = root

    _route.handler.forEach(layer => {
      const last = Object.assign({}, layer[layer.length - 1])
      delete last.children
      const _layer = layer.slice(0, -1).concat(last)
      routerView.children = this._resolveRouterViews(_layer, to)
      routerView = routerView.children[last.name || 'default']
    })

    to._routerViews = root.children
    this._generateMeta(to)
  }

  _resolveRouterViews(routerViews, route) {
    const _routerViews = {}

    routerViews.forEach(({ name = 'default', path, component, key, props, meta, beforeEnter, children }) => {
      const com = _routerViews[name] = { component, key, props }

      if (path) {
        com.path = path
        this._hooks.beforeRouteEnter = beforeEnter ? [].concat(beforeEnter).map(f => f.bind(this)) : []
      }

      if (meta) {
        route._meta.push(meta)
      }

      if (children) {
        children = children.filter(v => !(v instanceof Array) && !v.path)
        com.children = this._resolveRouterViews(children, route)
      }
    })

    return _routerViews
  }

  _generateMeta(route) {
    route.meta = {}

    if (route._meta.length) {
      route._meta.forEach(m => Object.assign(route.meta, m instanceof Function ? m(route) : m))
    }
  }

  _afterChange(to, _, action) {
    let promise = Promise.resolve(true)

    this._hooks.beforeUpdateOnce.concat(this._hooks.beforeUpdate).forEach(hook =>
      promise = promise.then(() =>
        Promise.resolve(hook.call(this, to.route, this.current, action, this)).then(result => {
          if (result === false) {
            throw result
          }
        })
      )
    )

    this._hooks.beforeUpdateOnce = []

    promise.catch(e => {
      if (e instanceof Error) {
        // encountered unexpected error
        throw e
      } else {
        // abort or redirect
        return e
      }
    }).then(v => {
      if (v !== false) {
        const from = Object.assign({}, this.current)
        Object.assign(this.current, to.route)

        this._hooks.afterChangeOnce.concat(this._hooks.afterChange).forEach(hook => {
          hook.call(this, to.route, from, action, this)
        })

        this._hooks.afterChangeOnce = []
      }
    })
  }

  start(loc) {
    return this._history.start(loc)
  }

  normalize(loc) {
    return this._history.normalize(loc)
  }

  url(loc) {
    return this._history.url(loc)
  }

  dispatch(loc) {
    return this._history.dispatch(loc)
  }

  push(loc) {
    return this._history.push(loc)
  }

  replace(loc) {
    return this._history.replace(loc)
  }

  go(n, opts) {
    return this._history.go(n, opts)
  }

  back(opts) {
    return this._history.back(opts)
  }

  forward(opts) {
    return this._history.forward(opts)
  }

  captureLinkClickEvent(e) {
    return this._history.captureLinkClickEvent(e)
  }
}
