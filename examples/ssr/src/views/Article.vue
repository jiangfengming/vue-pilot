<template>
<div>
  <h1>Article ID: {{ id }}</h1>
  <p><router-link to="/articles/1">/articles/1</router-link></p>
  <p><router-link to="/articles/2">/articles/2</router-link></p>
</div>
</template>

<script>
export default {
  props: ['id']
}
</script>
