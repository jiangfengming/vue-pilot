import UrlRouter from 'url-router'
import RouterView from './RouterView'
import RouterLink from './RouterLink'

export default class {
  static install(Vue) {
    Vue.component('router-view', RouterView)
    Vue.component('router-link', RouterLink)

    Vue.mixin({
      data() {
        return this.$root === this ? { $route: null } : {}
      },

      beforeCreate() {
        if (this.$options.router) {
          this.$router = this.$options.router
          this.$router.app = this

          Object.defineProperty(this, '$route', {
            get() { return this.$data.$route },
            set(v) { this.$data.$route = v }
          })
        } else {
          this.$router = this.$root.$router

          if (this.$vnode && this.$vnode.data._routerView && this.$options.beforeRouteLeave) this.$root.$route._beforeLeaveHooksInComp.push(this.$options.beforeRouteLeave.bind(this))
        }
      }
    })
  }

  constructor({ routes }) {
    this._routes = this._parseRoutes(routes)
    this._urlRouter = new UrlRouter(this._routes)
    this._beforeChangeHooks = []
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
        params: _route.params,
        _beforeLeaveHooksInComp: [],
        _beforeEnterHooks: []
      }

      if (_route.options.meta) {
        if (_route.options.meta.constructor === Function) route.meta = _route.options.meta(route)
        else route.meta = _route.options.meta
      } else {
        route.meta = {}
      }

      const mainView = {
        component: _route.result,
        props: _route.options.props,
        children: _route.options.children
      }

      route.layout = this._resolveLayout(route, mainView, _route.options.layout)

      let prom = Promise.resolve(true)
      ;[].concat(
        this.current ? this.current._beforeLeaveHooksInComp : [],
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

      prom.catch(e => e).then(result => resolve(result))
    })
  }

  _change(to) {
    this.current = this.app.$route = to.route
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

      // create a copy
      resolved[name] = view = {
        component: view.component,
        props: view.props,
        children: view.children
      }

      if (view.props && view.props.constructor === Function) view.props = view.props(route)
      if (view.children) view.children = this._resolveLayout(route, mainView, view.children)
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
    return this._history.setState(state)
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
