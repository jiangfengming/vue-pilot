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

    target: String
  },

  render(h, { parent, props, children, listeners, data }) {
    const router = parent.$router
    const hasWindow = typeof window === 'object'
    let href, to
    let addEvent = false

    if (!props.to) {
      href = 'javascript:'
    } else {
      const isAbsURL = props.to.constructor === String && /^\w+:/.test(props.to)

      if (isAbsURL) {
        if (router.origin.length) {
          try {
            const url = new URL(props.to)

            if (router.origin.includes(url.origin) && url.pathname.startsWith(router.url('/'))) {
              to = router.normalize(props.to)
            }
          } catch (e) {
            // nop
          }
        }
      } else {
        to = router.normalize(props.to)
      }

      if (to && router._urlRouter.find(to.path)) {
        href = to.url

        if (to.path === router.current.path) {
          data.class = 'active'
        }

        if (hasWindow) {
          addEvent = true
        }
      } else {
        href = isAbsURL ? props.to : to.url
      }
    }

    if (props.tag === 'a') {
      data.attrs.href = href

      if (props.target) {
        const target = props.target
        data.attrs.target = target

        if (addEvent
          && (
            target === '_blank'
            || target === '_parent' && window.parent !== window
            || target === '_top' && window.top !== window
            || !(target in { _self: 1, _blank: 1, _parent: 1, _top: 1 }) && target !== window.name
          )
        ) {
          addEvent = false
        }
      }

      // hash change
      if (addEvent
        && to.path === router.current.path
        && to.query.source.toString() === router.current.query.source.toString()
        && to.hash
      ) {
        addEvent = false
      }
    }

    if (addEvent) {
      data.on = Object.assign({}, listeners, {
        click: listeners.click ? [].concat(listeners.click, click) : click
      })
    }

    return h(props.tag, data, children)

    function click(e) {
      if (!e.defaultPrevented) {
        e.preventDefault()
        router[props.action](to)
      }
    }
  }
}
