<template>
<div>
  <h1>Article ID: {{ id }}</h1>
  <p><router-link to="/articles/1">/articles/1</router-link></p>
  <p><router-link to="/articles/2">/articles/2</router-link></p>
</div>
</template>

<script>
import titleMixin from 'src/shared/titleMixin'

export default {
  mixins: [titleMixin],

  props: ['id'],

  watch: {
    id: 'load'
  },

  created() {
    this.load()
  },

  methods: {
    load() {
      this.setDocumentTitle('article ' + this.id)
    }
  }
}
</script>
