import UrlRouter from 'url-router'
import RouterView from './RouterView'
import RouterLink from './RouterLink'

export default class {
  static install(Vue) {
    Vue.component('router-view', RouterView)
    Vue.component('router-link', RouterLink)

    Vue.mixin({
      data() {
        return this.$root === this && this.$root.$options.router ? { $route: this.$root.$options.router.current } : {}
      },

      beforeCreate() {
        if (!this.$root.$options.router) return

        if (this.$options.router) {
          this.$router = this.$options.router
          this.$route = this.$router.current
        } else {
          this.$router = this.$root.$router

          if (this.$vnode && this.$vnode.data._routerView && this.$options.beforeRouteLeave) {
            this.$root.$route._beforeLeaveHooksInComp.push(this.$options.beforeRouteLeave.bind(this))
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
      query: null,
      hash: null,
      fullPath: null,
      state: null,
      params: null,
      meta: null,
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

  _parseRoutes(routerViews, depth = [], parsed = []) {
    for (const routerView of routerViews) {
      if (routerView.constructor === Array) {
        const names = routerView.map(c => c.name)
        const children = [...routerView, ...routerViews.filter(v => v.constructor !== Array && !v.path && !names.includes(v.name))]
        this._parseRoutes(children, depth, parsed)
      } else if (routerView.path) {
        const children = [routerView, ...routerViews.filter(v => v.constructor !== Array && !v.path && v.name !== routerView.name)]
        parsed.push([routerView.path, [...depth, children]])
      } else if (routerView.children) {
        const children = [routerView, ...routerViews.filter(v => v.constructor !== Array && !v.path && v.name !== routerView.name)]
        this._parseRoutes(routerView.children, [...depth, children], parsed)
      }
    }

    return parsed
  }

  _beforeChange(to) {
    return new Promise(resolve => {
      const _route = this._urlRouter.find(to.path)
      if (!_route) return false

      const route = to.route = {
        path: to.path,
        fullPath: to.fullPath,
        query: to.query,
        hash: to.hash,
        state: to.state,
        params: _route.params,
        meta: {},
        _beforeLeaveHooksInComp: [],
        _beforeEnterHooks: [],
        _asyncComponents: [],
        _meta: []
      }

      route._layout = this._resolveRoute(route, _route.result)

      this._generateMeta(route)

      let prom = Promise.resolve(true)

      ;[].concat(
        this.current.path ? this.current._beforeLeaveHooksInComp : [], // not landing page
        this._beforeChangeHooks,
        route._beforeEnterHooks
      ).forEach(hook =>
        prom = prom.then(() =>
          Promise.resolve(hook(route, this.current)).then(result => {
            // if the hook abort or redirect the navigation, cancel the promise chain.
            if (!(result === true || result == null)) throw result
          })
        )
      )

      prom.catch(e => {
        if (e instanceof Error) throw e // encountered unexpected error
        else return e // the result of cancelled promise
      }).then(result => resolve(result))
    })
  }

  _generateMeta(route) {
    if (route._meta.length) {
      route._meta.forEach(m => Object.assign(route.meta, m.constructor === Function ? m(route) : m))
    }
  }

  _change(to) {
    Promise.all(to.route._asyncComponents).then(() => {
      Object.assign(this.current, to.route)
      this._afterChangeHooks.forEach(hook => hook(this.current))
    }).catch(e => this._handleError(e))
  }

  _handleError(e) {
    this._errorHooks.forEach(hook => hook(e))
  }

  _resolveRoute(route, depth) {
    const layout = {}
    let current = layout

    for (const routerViews of depth) {
      current.children = {}

      for (const routerView of routerViews) {
        current.children[routerView.name || 'default'] = Object.assign({}, routerView)
      }

      current = current.children[routerViews[0].name || 'default']
    }

    delete current.path

    return this._resolveRouterViews(route, layout.children)
  }

  _resolveRouterViews(route, routerViews) {
    const resolved = {}

    for (const name in routerViews) {
      const routerView = routerViews[name]

      if (routerView.constructor === Array || routerView.path) continue

      const v = resolved[name] = { props: routerView.props }

      if (routerView.meta) {
        route._meta.push(routerView.meta)
      }

      if (routerView.beforeEnter) {
        route._beforeEnterHooks.push(routerView.beforeEnter)
      }

      if (routerView.component && routerView.component.constructor === Function) {
        route._asyncComponents.push(
          routerView.component().then(component => v.component = component)
        )
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

    // Vue can not react if add new prop into state
    // so we replace it with a new state object
    this.current.state = { ...this._history.current.state }

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
