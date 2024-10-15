
<script setup lang="ts">
  import QuaternionDisplay from './components/QuaternionDisplay.vue';
  import Inputs from './components/Inputs.vue';
  import { provide, ref } from 'vue';
  import { Quaternion, Vector3 } from 'three';

  const quaternion = ref(new Quaternion(0, 0, 0, 1));
  const vector = ref(new Vector3(1, 0, 0));
  provide("quaternion", quaternion);
  provide("vector", vector);
</script>

<template>
  <div id="container">
    <QuaternionDisplay ref="quaternion"/>
    <Inputs @quaternion="(inputQuaternion) => {quaternion = inputQuaternion;}" @vector="(inputVector) => {vector = inputVector;}"/>
  </div>
</template>

<style lang="scss">
  #container {
      display: flex;
      flex-direction: row-reverse;
      width: 100%;
      height: 100%;
  }

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

