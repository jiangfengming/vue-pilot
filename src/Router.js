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
        parsed.push([route.path, route.component, { meta: route.meta, props: route.props, layout: null }])
      } else if (route.layout) {
        const rts = this._findRoutesInLayout(route.layout)
        if (rts) rts.forEach(r => parsed.push([r.path, r.component, { meta: r.meta, props: r.props, layout: route.layout }]))
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

    let route
    if (_route.options.layout) {
      route = this._resolveLayout(_route.options.layout)
    } else {
      route = {
        default: {

        }
      }
    }
  }

  _resolveLayout(layout) {
    for (const routerViewName in layout) {
      let routerView = layout[routerViewName]

      if (routerView.component.constructor === String) {
        this.resolveComponent(routerView.component).then(component => routerView.component = component)
      }
    }
  }

  static install(Vue) {
    Vue.component('router-view', view)
  }
}

export default VueRouter
