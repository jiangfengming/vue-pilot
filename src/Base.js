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

          Object.defineProperty(this, '$route', {
            get() { return this.$data.$route },
            set(v) { this.$data.$route = v }
          })
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
    this.current = {
      path: null,
      query: null,
      hash: null,
      fullPath: null,
      state: null,
      params: null,
      meta: null,
      _layout: null
    }
  }

  beforeChange(cb) {
    this._beforeChangeHooks.push(cb)
  }

  _parseRoutes(routes) {
    const parsed = []
    routes.forEach(route => {
      if (route.path) {
        parsed.push([
          route.path,
          route.component,
          {
            meta: route.meta,
            props: route.props,
            children: route.children,
            layout: null,
            beforeEnter: route.beforeEnter
          }
        ])
      } else if (route.layout) {
        const rts = this._findRoutesInLayout(route.layout)
        if (rts) {
          rts.forEach(r => parsed.push([
            r.path,
            r.component,
            {
              meta: r.meta,
              props: r.props,
              children: r.children,
              layout: route.layout,
              beforeEnter: r.beforeEnter
            }
          ]))
        }
      }
    })

    return parsed
  }

  _findRoutesInLayout(layout) {
    for (const name in layout) {
      const section = layout[name]
      if (section.constructor === Array) {
        return section
      } else if (section.children) {
        if (section.children.constructor === Array) {
          return section.children
        } else {
          const routes = this._findRoutesInLayout(section.children)
          if (routes) return routes
        }
      }
    }
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
        _beforeLeaveHooksInComp: [],
        _beforeEnterHooks: [],
        _asyncComponents: []
      }

      if (!_route.options.meta) {
        route.meta = {}
      } else if (_route.options.meta.constructor === Function) {
        route._metaFactory = _route.options.meta
        route.meta = route._metaFactory(route)
      } else {
        route.meta = _route.options.meta
      }

      const mainView = {
        component: _route.result,
        props: _route.options.props,
        children: _route.options.children,
        beforeEnter: _route.options.beforeEnter
      }

      route._layout = this._resolveLayout(route, mainView, _route.options.layout)

      let prom = Promise.resolve(true)
      ;[].concat(
        this.current.path ? this.current._beforeLeaveHooksInComp : [],
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
        if (e instanceof Error) throw e
        else return e
      }).then(result => resolve(result))
    })
  }

  _change(to) {
    Promise.all(to.route._asyncComponents).then(() => {
      Object.assign(this.current, to.route)
    })
  }

  _resolveLayout(route, mainView, layout) {
    const resolved = {}

    if (!layout) {
      layout = {
        default: mainView
      }
    }

    for (const name in layout) {
      let view = layout[name]

      if (view.constructor === Array) view = mainView

      if (view.beforeEnter) route._beforeEnterHooks.push(view.beforeEnter)

      const v = resolved[name] = { props: view.props }

      if (view.component.constructor === Function) {
        route._asyncComponents.push(view.component().then(component => v.component = view.component = component))
      } else {
        v.component = view.component
      }

      if (view.children) resolved[name].children = this._resolveLayout(route, mainView, view.children)
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

    // meta factory function may use state object to generate meta object
    // so we need to re-generate a new meta
    if (this.current._metaFactory) this.current.meta = this.current._metaFactory(this.current)
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

  hookAnchorElements(container) {
    return this._history.hookAnchorElements(container)
  }
}
