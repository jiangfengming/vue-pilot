export default {
  created() {
    if (this.$options.title) {
      this.setDocumentTitle(this.$options.title)
    }
  },

  methods: {
    setDocumentTitle(title, suffix = ' - Your company name') {
      if (suffix) title += suffix

      if (this.$ssrContext) {
        this.$ssrContext.title = title
      } else if (typeof window === 'object') {
        window.document.title = title
      }
    }
  }
}
