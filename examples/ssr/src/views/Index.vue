<template>
<div>
  <h1>home</h1>
  <p>foo: {{ foo }}</p>
</div>
</template>

<script>
export default {
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
