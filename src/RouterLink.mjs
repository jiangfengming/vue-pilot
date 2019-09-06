export default {
  functional: true,

  props: {
    to: {
      type: [String, Object]
    }
  },

  render(h, { parent, props, children, listeners, data }) {
    const router = parent.$router
    const isAbsURL = props.to && props.to.constructor === String && /^https?:/.test(props.to)

    data.attrs.href = props.to
      ? isAbsURL ? props.to : router.url(props.to)
      : 'javascript:'

    data.on = Object.assign({}, listeners, {
      click: listeners.click ? [].concat(listeners.click, click) : click
    })

    return h('a', data, children)

    function click(e) {
      if (e.defaultPrevented) {
        return
      }

      const a = e.currentTarget

      // open new window
      const target = a.target

      if (target && (
        target === '_blank'
        || target === '_parent' && window.parent !== window
        || target === '_top' && window.top !== window
        || !(target in { _self: 1, _blank: 1, _parent: 1, _top: 1 }) && target !== window.name
      )) {
        return
      }

      // outside of app
      if (isAbsURL && !props.to.startsWith(location.origin + router.url('/'))) {
        return
      }

      const to = router.normalize(props.to)

      if (!router._urlRouter.find(to.path)) {
        return
      }

      // hash change
      if (to.path === router.current.path
        && to.query.source.toString() === router.current.query.source.toString()
        && to.hash
        && to.hash !== router.current.hash
      ) {
        return
      }

      e.preventDefault()
      router.push(to)
    }
  }
}
