import url from 'x-url'
import UrlRouter from 'url-router'
import view from './view'

class VueRouter {
  constructor({ routes, mode = 'history', base }) {
    this.mode = mode
    this.base = base
    this.routes = this._parseRoutes(routes)
    this.router = new UrlRouter(this.routes)
  }

  _parseRoutes(routes) {
    const parsed = []
    routes.forEach(route => {
      if (route.path) {
        parsed.push([route.path, route.component, { meta: route.meta, props: route.props, children: route.children, layout: null }])
      } else if (route.layout) {
        const rts = this._findRoutesInLayout(route.layout)
        if (rts) rts.forEach(r => parsed.push([r.path, r.component, { meta: r.meta, props: r.props, children: r.children, layout: route.layout }]))
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

  resolve(u) {
    u = url.parse(u)
    const _route = this.router.find(u.pathname)
    if (!_route) return false

    const mainView = {
      component: _route.result,
      meta: _route.options.meta,
      props: _route.options.props,
      children: _route.options.children
    }

    let route
    if (_route.options.layout) {
      route = this._resolveLayout(_route.options.layout, mainView)
    } else {
      route = this._resolveLayout({ default: mainView })
    }


  }

  _resolveLayout(layout, mainView, asyncComponents = []) {
    for (const viewName in layout) {
      let routerView = layout[viewName]

      if (routerView.constructor === Array) {
        routerView = layout[viewName] = mainView
      }

      if (routerView.component.constructor === String) {
        asyncComponents.push(routerView)
      } else if (routerView.children) {
        this._resolveLayout(routerView.children, mainView, asyncComponents)
      }
    }
  }

  static install(Vue) {
    Vue.component('router-view', view)
  }
}

export default VueRouter
