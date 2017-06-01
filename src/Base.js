import UrlRouter from 'url-router'
import RouterView from './RouterView'
import RouterLink from './RouterLink'

export default class {
  static install(Vue) {
    Vue.component('router-view', RouterView)
    Vue.component('router-link', RouterLink)

    Vue.mixin({
      beforeCreate() {
        if (this.$vnode.data._isRouteView && this.$options.beforeRouteLeave) {
          this.$route._leaveHooks.push(this.$options.beforeRouteLeave.bind(this))
        }
      }
    })
  }

  constructor({ routes }) {
    this._routes = this._parseRoutes(routes)
    this._urlRouter = new UrlRouter(this._routes)
    this._beforeLeaveHooks = []
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

  _beforeChange(to, from) {
    return new Promise((resolve, reject) => {
      console.log(to)
      const _route = this._urlRouter.find(to.path)
      console.log(_route)
      if (!_route) return false

      const route = {
        path: to.path,
        fullPath: to.fullPath,
        query: to.query,
        hash: to.hash,
        params: _route.params,
        _beforeLeaveHooksInComp: [],
        _beforeEnterHooks: [],
        _beforeEnterHooksInComp: []
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

      route.components = this._resolveComponents(route, mainView, _route.options.layout)


      const hooks = this.current._beforeLeaveHooksInComp.concat(this._beforeLeaveHooks, route._beforeEnterHooks, route._beforeEnterHooksInComp)

      let promise
      for (const hook of hooks) {
        promise = promise.then(() => {
          Promise.resolve(hook(route, this.current)).then(result => {
            if (!(result === true || result == null)) throw result
          })
        })
      }

      promise.catch(result => {
        resolve(result)
      })
    })
  }

  _change(to) {
    console.log(to)
  }

  _resolveComponents(route, mainView, layout, asyncComponents = []) {
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
      view = {
        component: view.component,
        props: view.props,
        children: view.children
      }

      if (view.props && view.props.constructor === Function) view.props = view.props(route)
      resolved[name] = view

      if (view.component.constructor !== Object) {
        asyncComponents.push(view)
      } else if (view.children) {
        this._resolveComponents(route, mainView, view.children, asyncComponents)
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

  gotoStatelessLocation(loc) {
    return this._history.gotoStatelessLocation(loc)
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
