<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'my-libs-electron'
  }
</script>

<style  lang="scss">
  /* CSS */
  @import './styles/index.scss';

.container {
  box-sizing: border-box;
  margin: 0 auto;
  padding: 30px 60px;
}
</style>
