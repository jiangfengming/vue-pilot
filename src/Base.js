import UrlRouter from 'url-router'
import RouterView from './RouterView'
import RouterLink from './RouterLink'

const IS_BROWSER = typeof window === 'object'

function getMergedOption(options, name) {
  const a = []

  if (options.extends) {
    a.push(...getMergedOption(options.extends, name))
  }

  if (options.mixins) {
    for (const mixin of options.mixins) {
      a.push(...getMergedOption(mixin, name))
    }
  }

  if (options[name]) {
    a.push(options[name])
  }

  return a
}

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
          const privates = this.$router.current._privates
          delete this.$router.current._privates
          this.$route = new Vue({
            data: { route: this.$router.current }
          }).route
          this.$router.current._privates = privates
        } else {
          this.$router = this.$root.$router

          if (this.$vnode && this.$vnode.data._routerView) {
            this.$root.$route._privates.beforeLeaveHooksInComp.push(...getMergedOption(this.constructor.extendOptions, 'beforeRouteLeave'))
          }
        }
      }
    })
  }

  constructor({ routes, context }) {
    this._routes = this._parseRoutes(routes)
    this._urlRouter = new UrlRouter(this._routes)
    this.context = context

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

  once(event, handler) {
    const delegate = (...args) => {
      this.off(event, delegate)
      return handler(...args)
    }

    this.on(event, delegate)
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
        asyncData: to.asyncData,
        _privates: {
          layout: null,
          beforeLeaveHooksInComp: [],
          beforeEnterHooks: [],
          routerViewLoaders: [],
          meta: []
        }
      }

      route._privates.layout = this._resolveRoute(route, _route.handler)

      this._generateMeta(route)

      let promise = Promise.resolve(true)

      const beforeChangeHooks = [].concat(
        this.current.path ? this.current._privates.beforeLeaveHooksInComp : [], // not landing page
        this._hooks.beforeChange,
        route._privates.beforeEnterHooks
      )

      for (const hook of beforeChangeHooks) {
        promise = promise.then(() =>
          Promise.resolve(hook(route, this.current, op)).then(result => {
            // if the hook abort or redirect the navigation, cancel the promise chain.
            if (!(result === true || result == null)) throw result
          })
        )
      }

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

      if (rv.meta) route._privates.meta.push(rv.meta)

      if (rv.beforeEnter) route._privates.beforeEnterHooks.push(rv.beforeEnter)

      const loader = () =>
        (rv.component && rv.component.constructor === Function
          ? rv.component().then(m => m.__esModule ? m.default : m)
          : Promise.resolve(rv.component)
        ).then(component => {
          v.component = component
          return v
        })

      route._privates.routerViewLoaders.push(IS_BROWSER ? loader() : loader)

      if (rv.children && (!skipFirstRouterViewChildren || rv !== routerViews[0])) {
        const children = rv.children.filter(v => v.constructor !== Array && !v.path)
        if (children.length) v.children = this._resolveRouterViews(route, children)
      }
    }

    return resolved
  }

  _generateMeta(route) {
    for (const m of route._privates.meta) {
      Object.assign(route.meta, m.constructor === Function ? m(route) : m)
    }
  }

  _change({ route }) {
    let promise = Promise.resolve(true)

    for (const hook of this._hooks.afterChange) {
      promise = promise.then(() =>
        Promise.resolve(hook(route, this.current)).then(result => {
          if (result === false) throw result
        })
      )
    }

    promise.then(() => {
      Promise.all(route._privates.routerViewLoaders.map(rv => rv.constructor === Function ? rv() : rv)).then(routerViews => {
        const asyncDataViews = routerViews.filter(v => v.component.asyncData)

        let asyncDataPromise
        if (!route.asyncData) {
          asyncDataPromise = Promise.all(asyncDataViews.map(v => v.component.asyncData(route, this.context))).then(asyncData => route.asyncData = asyncData)
        }

        return Promise.resolve(route.asyncData || asyncDataPromise).then(asyncData => {
          asyncDataViews.forEach((v, i) => {
            v.component = {
              extends: v.component,
              data: () => asyncData[i]
            }
          })

          Object.assign(this.current, route)

          for (const hook of this._hooks.load) {
            hook(route)
          }
        })
      }).catch(e => this._handleError(e))
    }).catch(e => {
      if (e !== false) throw e
    })
  }

  _handleError(e) {
    for (const hook of this._hooks.error) hook(e)
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
