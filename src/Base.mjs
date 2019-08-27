import UrlRouter from 'url-router'
import RouterView from './RouterView'
import RouterLink from './RouterLink'

export default class {
  static install(Vue) {
    Vue.component('router-view', RouterView)
    Vue.component('router-link', RouterLink)

    Vue.config.optionMergeStrategies.beforeRouteLeave = (parent, child) => {
      return child ? (parent || []).concat(child) : parent
    }

    Vue.mixin({
      beforeCreate() {
        if (!this.$root.$options.router) {
          return
        }

        if (this.$root === this) {
          this.$router = this.$options.router

          // make current route reactive
          this.$route = Vue.observable(this.$router.current)
        } else {
          this.$router = this.$root.$router

          if (this.$vnode.data._routerView && this.$options.beforeRouteLeave) {
            this.$vnode.data._routerView.beforeLeave = this.$options.beforeRouteLeave.map(f => f.bind(this))
          }
        }
      }
    })
  }

  constructor({ routes }) {
    this._routes = this._parseRoutes(routes)
    this._urlRouter = new UrlRouter(this._routes)
    this._beforeChangeHooks = []
    this._afterChangeHooks = []
    this._errorHooks = []

    this.current = {
      path: null,
      query: {},
      hash: null,
      fullPath: null,
      state: {},
      params: {},
      meta: {},
      _routerViews: null
    }
  }

  beforeChange(hook) {
    this._beforeChangeHooks.push(hook)
  }

  afterChange(hook) {
    this._afterChangeHooks.push(hook)
  }

  onError(hook) {
    this._errorHooks.push(hook)
  }

  _parseRoutes(routerViews, tmpLayer = [], layers = [], parsed = []) {
    routerViews.forEach(routerView => {
      if (routerView instanceof Array) {
        // if `routerView` is an array,
        // the final router view (has `path` field) must be in `routerView`.
        this._parseRoutes(routerView, tmpLayer.concat(routerViews), layers, parsed)
      }

      else if (routerView.children) {
        const layer =
          // if `routerView` has children,
          // the final router view must be in children.
          // we only need sibling views in `routerViews` that name isn't routerView.name
          routerViews.filter(v => !(v instanceof Array) && !v.path && v.name !== routerView.name)
            .concat(routerView)

        this._parseRoutes(routerView.children, layers.concat([layer]), parsed)
      }

      else if (routerView.path) {
        const layer = [routerView].concat(
          // if `routerView` has `path`,
          // it is the final router view.
          // we only need sibling views in `routerViews` that name isn't routerView.name
          routerViews.filter(v => !(v instanceof Array) && !v.path && v.name !== routerView.name)
        )

        parsed.push([
          routerView.path,
          layers.concat([layer]),

          (matchedRoute, { to, from, action }) => {
            to.params = matchedRoute.params
            to._layout = this._resolveRoute(to, matchedRoute.handler)
            this._generateMeta(to)
            return routerView.test ? routerView.test(to, from, action) : true
          }
        ])
      }
    })

    return parsed
  }

  _beforeChange(to, from, action) {
    return new Promise(resolve => {
      const route = to.route = {
        path: to.path,
        fullPath: to.fullPath,
        url: to.url,
        query: to.query,
        hash: to.hash,
        state: to.state,
        meta: {},
        _beforeLeaveHooksInComp: [],
        _beforeEnterHooks: [],
        _asyncComponents: [],
        _meta: []
      }

      const _route = this._urlRouter.find(to.path, {
        to: route,
        from: this.current,
        action
      })

      if (!_route) {
        return false
      }

      let promise = Promise.resolve(true)

      ;[].concat(
        this.current.path ? this.current._beforeLeaveHooksInComp : [], // not landing page
        this._beforeChangeHooks,
        route._beforeEnterHooks
      ).forEach(hook =>
        promise = promise.then(() =>
          Promise.resolve(hook(route, this.current, action)).then(result => {
            // if the hook abort or redirect the navigation, cancel the promise chain.
            if (result !== undefined && result !== true) {
              throw result
            }
          })
        )
      )

      promise.catch(e => {
        if (e instanceof Error) {
          throw e // encountered unexpected error
        } else {
          return e // the result of cancelled promise
        }
      }).then(result => resolve(result))
    })
  }

  _generateMeta(route) {
    if (route._meta.length) {
      route._meta.forEach(m => Object.assign(route.meta, m instanceof Function ? m(route) : m))
    }
  }

  _change(to) {
    let promise = Promise.resolve(true)

    this._afterChangeHooks.forEach(hook =>
      promise = promise.then(() =>
        Promise.resolve(hook(to.route, this.current)).then(result => {
          if (result === false) {
            throw result
          }
        })
      )
    )

    promise.then(() => {
      Promise.all(to.route._asyncComponents.map(comp => comp())).then(() => {
        Object.assign(this.current, to.route)
      }).catch(e => this._handleError(e))
    }).catch(e => {
      if (e !== false) {
        throw e
      }
    })
  }

  _handleError(e) {
    this._errorHooks.forEach(hook => hook(e))
  }

  _resolveRoute(route, layers) {
    const layout = {}
    let node = layout

    layers.forEach(layer => {
      node.children = {}

      layer.forEach(routerView => {
        const child = node.children[routerView.name || 'default'] = Object.assign({}, routerView)

        if (child.children) {

        }
      })

      node = node.children[layer[0].name || 'default']
    })

    delete node.path

    return this._resolveRouterViews(route, layout.children)
  }

  _resolveRouterViews(route, routerViews) {
    const resolved = {}

    for (const name in routerViews) {
      const routerView = routerViews[name]

      if (routerView instanceof Array || routerView.path) {
        continue
      }

      const v = resolved[name] = { props: routerView.props }

      if (routerView.meta) {
        route._meta.push(routerView.meta)
      }

      if (routerView.beforeEnter) {
        Array.prototype.push.apply(route._beforeEnterHooks, [].concat(routerView.beforeEnter))
      }

      if (routerView.component && routerView.component instanceof Function) {
        route._asyncComponents.push(() => routerView.component().then(m => v.component = m.__esModule ? m.default : m))
      } else {
        v.component = routerView.component
      }

      if (routerView.children) {
        v.children = this._resolveRouterViews(route, routerView.children)
      }
    }

    return resolved
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

  setState(state) {
    this._history.setState(state)

    // Vue can not react if add new props into an existing object
    // so we replace it with a new state object
    this.current.state = Object.assign({}, this._history.current.state)

    // meta factory function may use state object to generate meta object
    // so we need to re-generate a new meta
    this._generateMeta(this.current)
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
