export default {
  functional: true,

  props: {
    to: {
      type: [String, Object]
    },

    action: {
      type: String,
      default: 'push'
    },

    tag: {
      type: String,
      default: 'a'
    },

    target: String,
    href: String
  },

  render(h, { parent, props, children, listeners, data }) {
    const router = parent.$router
    let url = props.to
    let href, to
    let spa = false

    if (!url) {
      href = 'javascript:'
    } else {
      const isAbsURL = url.constructor === String && /^\w+:/.test(url)

      if (isAbsURL) {
        if (router.origin.length) {
          try {
            const u = new URL(url)

            if (router.origin.includes(u.origin) && u.pathname.startsWith(router.url('/'))) {
              to = router.normalize(url)
              const locationOrigin = typeof window === 'object' && window.location && window.location.origin

              if (locationOrigin && u.origin !== locationOrigin) {
                url = locationOrigin + u.pathname + u.search + u.hash
              }
            }
          } catch (e) {
            // nop
          }
        }
      } else {
        to = router.normalize(url)
        url = to.url
      }

      if (to && router._urlRouter.find(to.path)) {
        spa = true
        href = to.url

        if (to.path === router.current.path) {
          data.class = 'active'
        }
      } else {
        href = isAbsURL ? url : to.url
      }
    }

    if (props.tag === 'a') {
      data.attrs.href = props.href || href

      if (props.target) {
        const target = props.target
        data.attrs.target = target

        if (
          spa &&
          (
            target === '_blank' ||
            target === '_parent' && window.parent !== window ||
            target === '_top' && window.top !== window ||
            !(target in { _self: 1, _blank: 1, _parent: 1, _top: 1 }) && target !== window.name
          )
        ) {
          spa = false
        }
      }

      // hash change
      if (
        spa &&
        to.path === router.current.path &&
        to.query.source.toString() === router.current.query.source.toString() &&
        to.hash
      ) {
        spa = false
      }
    }

    data.on = Object.assign({}, listeners, {
      click: listeners.click ? [].concat(listeners.click, click) : click
    })

    return h(props.tag, data, children)

    function click(e) {
      if (!e.defaultPrevented) {
        e.preventDefault()

        if (spa) {
          router[props.action](to)
        } else if (props.target) {
          window.open(url, props.target)
        } else if (props.action === 'push') {
          location = url
        } else {
          location.replace(url)
        }
      }
    }
  }
}
