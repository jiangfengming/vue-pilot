<template>
<div class="layout">
  <aside>
    <nav>
      <ul>
        <li><router-link to="/">home</router-link></li>
      </ul>
    </nav>
  </aside>

  <div class="content-wrapper">
    <router-view />
  </div>
</div>
</template>

<style scoped>
.layout {
  display: flex;
}

aside {
  width: 300px;
  background: #EEE;
}

.content-wrapper {
  flex-grow: 1;
  padding: 20px;
  background: #BBDEFB;
}
</style>
