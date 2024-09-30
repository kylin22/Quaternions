<script setup lang="ts">
  import QuaternionDisplay from './pages/QuaternionDisplay.vue';
</script>

<template>
  <QuaternionDisplay/>
</template>

<style lang="scss">
  #app {
    height: 100%;
    width: 100%;
  }

  body {
    background-color: black;
  }

  body, html {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    color: white;
    letter-spacing: 3px;
  }
</style>

