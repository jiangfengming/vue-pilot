export default class {
  constructor({ routes, mode = 'history', base }) {
    this.mode = mode
    this.base = base
    this.routes = this.parseRoutes(routes)
  }

  parseRoutes(routes) {
    const parsed = []
    for (const route in routes) {
      if (route.path) {
        parsed.push([route.path, route.file, { options: route.options, props: route.props, layout: null }])
      } else {

      }
    }
  }
}
