import UrlRouter from 'url-router'
import RouterView from './RouterView'
import RouterLink from './RouterLink'

export default class {
  static install(Vue) {
    Vue.component('router-view', RouterView)
    Vue.component('router-link', RouterLink)

    Vue.mixin({
      beforeCreate() {
        if (!this.$root.$options.router) return

        if (this.$options.router) {
          this.$router = this.$options.router

          // make current route reactive
          this.$route = new Vue({
            data: { route: this.$router.current }
          }).route
        } else {
          this.$router = this.$root.$router

          if (this.$vnode && this.$vnode.data._routerView) {
            const hooks = this.$root.$route._beforeLeaveHooksInComp
            const options = this.constructor.extendOptions

            if (options.extends && options.extends.beforeRouteLeave) {
              hooks.push(options.extends.beforeRouteLeave.bind(this))
            }

            if (options.mixins) {
              options.mixins.forEach(mixin => {
                if (mixin.beforeRouteLeave) {
                  hooks.push(mixin.beforeRouteLeave.bind(this))
                }
              })
            }

            if (options.beforeRouteLeave) {
              hooks.push(options.beforeRouteLeave.bind(this))
            }
          }
        }
      }
    })
  }

  constructor({ routes }) {
    this._routes = this._parseRoutes(routes)
    this._urlRouter = new UrlRouter(this._routes)

    this._hooks = {
      beforeChange: [],
      afterChange: [],
      load: [],
      error: []
    }

    this.current = {
      path: null,
      query: null,
      hash: null,
      fullPath: null,
      state: null,
      params: null,
      meta: null
    }
  }

  _parseRoutes(routerViews, depth = [], parsed = []) {
    for (const rv of routerViews) {
      if (rv.constructor === Array) { // a group of routerViews, merge and override uppper level definitions
        const names = rv.map(c => c.name)
        this._parseRoutes([...rv, ...routerViews.filter(v => v.constructor !== Array && !v.path && !names.includes(v.name))], depth, parsed)
      } else if (rv.path) { // finally get the main router view
        parsed.push([rv.path, [...depth, [rv, ...routerViews.filter(v => v.constructor !== Array && !v.path && v.name !== rv.name)]]])
      } else if (rv.children) { // parent router view. look into it's children
        this._parseRoutes(rv.children, [...depth, [rv, ...routerViews.filter(v => v.constructor !== Array && !v.path && v.name !== rv.name)]], parsed)
      }
    }

    return parsed
  }

  on(event, handler) {
    this._hooks[event].push(handler)
  }

  off(event, handler) {
    this._hooks[event] = this._hooks[event].filter(h => h !== handler)
  }

  _beforeChange(to, from, op) {
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
        _meta: [],
        _prefetch: []
      }

      route._layout = this._resolveRoute(route, _route.handler)

      this._generateMeta(route)

      let promise = Promise.resolve(true)

      ;[].concat(
        this.current.path ? this.current._beforeLeaveHooksInComp : [], // not landing page
        this._hooks.beforeChange,
        route._beforeEnterHooks
      ).forEach(hook =>
        promise = promise.then(() =>
          Promise.resolve(hook(route, this.current, op)).then(result => {
            // if the hook abort or redirect the navigation, cancel the promise chain.
            if (!(result === true || result == null)) throw result
          })
        )
      )

      promise.catch(e => {
        if (e instanceof Error) throw e // encountered unexpected error
        else return e // the result of cancelled promise
      }).then(result => resolve(result))
    })
  }

  _resolveRoute(route, depth) {
    const layout = {}
    let current = layout

    for (const routerViews of depth) {
      current.children = this._resolveRouterViews(route, routerViews, routerViews !== depth[depth.length - 1])
      current = current.children[routerViews[0].name || 'default'] // go deeper
    }

    return layout.children
  }

  _resolveRouterViews(route, routerViews, skipFirstRouterViewChildren = false) {
    const resolved = {}

    for (const rv of routerViews) {
      const v = resolved[rv.name || 'default'] = { props: rv.props }

      if (rv.meta) route._meta.push(rv.meta)

      if (rv.beforeEnter) route._beforeEnterHooks.push(rv.beforeEnter)

      if (rv.component && rv.component.constructor === Function) {
        route._asyncComponents.push(
          rv.component().then(m => v.component = m.__esModule ? m.default : m)
        )
      } else {
        v.component = rv.component
      }

      if (rv.children && (!skipFirstRouterViewChildren || rv !== routerViews[0])) {
        const children = rv.children.filter(v => v.constructor !== Array && !v.path)
        if (children.length) v.children = this._resolveRouterViews(route, children)
      }
    }

    return resolved
  }

  _generateMeta(route) {
    if (route._meta.length) {
      route._meta.forEach(m => Object.assign(route.meta, m.constructor === Function ? m(route) : m))
    }
  }

  _change(to) {
    let promise = Promise.resolve(true)

    this._hooks.afterChange.forEach(hook =>
      promise = promise.then(() =>
        Promise.resolve(hook(to.route, this.current)).then(result => {
          if (result === false) throw result
        })
      )
    )

    promise.then(() => {
      Promise.all(to.route._asyncComponents).then(() => {
        Object.assign(this.current, to.route)
        // this._prefetch()
      }).catch(e => this._handleError(e))
    }).catch(e => {
      if (e !== false) throw e
    })
  }

  // _prefetch() {
  //   this.current.
  // }

  _handleError(e) {
    this._hooks.error.forEach(hook => hook(e))
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
