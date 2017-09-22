<template>
<div>
  <h1>Article ID: {{ id }}</h1>
  <p><router-link to="/articles/1">/articles/1</router-link></p>
  <p><router-link to="/articles/2">/articles/2</router-link></p>
</div>
</template>

<script>
// won't load on server side
console.log(1) // eslint-disable-line

export default {
  props: ['id']
}
</script>
