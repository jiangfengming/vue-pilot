export default class {
  constructor({ routes, mode = 'history', base }) {
    this.mode = mode
    this.base = base
    this.routes = this.parseRoutes(routes)
  }

  parseRoutes(routes) {
    const parsed = []
    routes.forEach(route => {
      if (route.path) {
        parsed.push([route.path, route.file, { meta: route.meta, props: route.props, layout: null }])
      } else {
        const rts = this.findRoutesInLayout(route)
        if (rts) rts.forEach(r => parsed.push([r.path, r.file, { meta: r.meta, props: r.props, layout: route }]))
      }
    })
  }

  findRoutesInLayout(layout) {
    for (const name in layout) {
      const section = layout[name]
      if (section.routes) {
        return layout[name].routes
      } else if (section.children) {
        const routes = this.findRoutesInLayout(section.children)
        if (routes) return routes
      }
    }
  }
}
