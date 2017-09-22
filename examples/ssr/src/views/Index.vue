<template>
<div>
  <h1>home</h1>
  <p>foo: {{ foo }}</p>
  <p><router-link to="/articles/1">/articles/1</router-link></p>
</div>
</template>

<script>
export default {
  extends: {
    created() {
      console.log('created of extends') // eslint-disable-line
    },

    beforeRouteLeave() {
      console.log('beforeRouteLeave of extends') // eslint-disable-line
    },

    mixins: [
      {
        beforeRouteLeave() {
          console.log('beforeRouteLeave of mixins of extends') // eslint-disable-line
        }
      }
    ]
  },

  mixins: [
    {
      beforeRouteLeave() {
        console.log('beforeRouteLeave of mixins') // eslint-disable-line
      }
    }
  ],

  beforeRouteLeave() {
    console.log('beforeRouteLeave') // eslint-disable-line
  },

  asyncData() {
    return new Promise(resolve => {
      setTimeout(() => resolve({ foo: 1 }), 1)
    })
  }
}
</script>

<style scoped>
h1 {
  color: red;
}
</style>
