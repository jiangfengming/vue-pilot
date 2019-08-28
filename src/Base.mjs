import UrlRouter from 'url-router'
import RouterView from './RouterView'
import RouterLink from './RouterLink'

export default class {
  static install(Vue) {
    Vue.component('router-view', RouterView)
    Vue.component('router-link', RouterLink)
  }

  constructor({ routes }) {
    this._routes = this._parseRoutes(routes)
    this._urlRouter = new UrlRouter(this._routes)
    this._beforeChangeHooks = []
    this._afterChangeHooks = []

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
    routerViews.forEach(routerView => {
      if (routerView instanceof Array) {
        let sib = routerViews.filter(v => !(v instanceof Array) && !v.path)
        const names = sib.map(v => v.name)
        // router views in same array has higher priority than outer ones
        sib = siblings.filter(v => !names.includes(v.name)).concat(sib)
        this._parseRoutes(routerView, sib, layers, parsed)
      } else {
        const layer = siblings.filter(v => v.name !== routerView.name).concat(routerView)
        const _layers = layers.concat([layer])

        if (routerView.children) {
          this._parseRoutes(routerView.children, _layers, parsed)
        } else if (routerView.path) {
          parsed.push([
            routerView.path,
            _layers,

            (matchedRoute, { to, from, action }) => {
              this._resolveRoute(to, from, matchedRoute)
              return this._test(to, from, action)
            }
          ])
        }
      }
    })

    return parsed
  }

  _resolveRoute(to, from, matchedRoute) {
    to.params = matchedRoute.params
    to._meta = []
    to._test = []
    to._beforeEnter = []

    const root = {}
    let routerView = root

    matchedRoute.handler.forEach(layer => {
      const last = Object.assign({}, layer[layer.length - 1])
      delete last.children
      const _layer = layer.slice(0, -1).concat(last)
      routerView.children = this._resolveRouterViews(_layer, to)
      routerView = routerView.children[last.name || 'default']
    })

    to._layout = root.children
    this._generateMeta(to)
  }

  _resolveRouterViews(routerViews, route) {
    const _routerViews = {}

    routerViews.forEach(({ name = 'default', path, component, props, meta, test, beforeEnter, children }) => {
      const com = _routerViews[name] = { component, props }

      if (meta) {
        route._meta.push(meta)
      }

      if (test) {
        Array.prototype.push.apply(route._test, [].concat(test))
      }

      if (path && beforeEnter) {
        Array.prototype.push.apply(route._beforeEnter, [].concat(beforeEnter))
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

  setState(state) {
    this._history.setState(state)

    // Vue can not react if add new props into an existing object
    // so we replace it with a new state object
    this.current.state = Object.assign({}, this._history.current.state)

    // meta factory function may use state object to generate meta object
    // so we need to re-generate a new meta
    this._generateMeta(this.current)
  }

  _test(to, from, action) {
    return !to._test.some(t => !t(to, from, action))
  }

  beforeChange(hook) {
    this._beforeChangeHooks.push(hook)
  }

  _beforeChange(to, from, action) {
    const route = to.route = {
      path: to.path,
      fullPath: to.fullPath,
      url: to.url,
      query: to.query,
      hash: to.hash,
      state: to.state
    }

    const _route = this._urlRouter.find(to.path, {
      to: route,
      from: this.current,
      action
    })

    if (!_route) {
      return false
    }

    const hooks = [].concat(from._getBeforeLeaveHooks(), to._beforeEnter, this._beforeChangeHooks)

    if (!hooks.length) {
      return true
    }

    let promise = Promise.resolve(true)

    hooks.forEach(hook =>
      promise = promise.then(() =>
        Promise.resolve(hook(route, this.current, action)).then(result => {
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

  afterChange(hook) {
    this._afterChangeHooks.push(hook)
  }

  _afterChange(to, from, action) {
    from = Object.assign({}, this.current)
    Object.assign(this.current, to.route)
    this._afterChangeHooks.forEach(hook => hook(this.current, from, action))
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
