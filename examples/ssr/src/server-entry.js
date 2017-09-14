import Vue from 'vue'
import App from './App'
import createRouter from './router'
import createStore from './store'

export default context =>
  new Promise((resolve, reject) => {
    const router = context.router = createRouter()
    const store = context.store = createStore()

    router.on('beforeChange', to => {
      if (to.meta.httpStatus === 404) {
        reject({ code: 404 })
        return false
      }

      if (!to.meta.ssr) {
        reject({ code: 0 })
        return false
      }
    })

    router.on('load', route => {
      const app = new Vue(App)
      context.asyncData = route.asyncData
      context.state = store.$state
      context.title = app.title
      resolve(app)
    })

    router.on('error', e => {
      reject(e)
    })

    router.start({
      path: context.url,
      external: true,
      context
    })
  })
