<template>
  <div class="container">{{ foo }}</div>
</template>
<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'

  @Component()
  export default class App extends Vue {
    foo: string = 'Hello World!!!';
  }
</script>