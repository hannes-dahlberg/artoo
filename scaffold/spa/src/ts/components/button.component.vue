<template>
  <button v-on:click="click">
    <div style="position: relative; width: 100%;">
      <div v-if="loading" style="position: absolute; top: 0px; left: 0px; width: 100%;">
        <i class="fas fa-spinner fa-pulse"></i>
      </div>
    </div>
    <span v-bind:style="{ visibility: loading ? 'hidden' : 'visible' }">
      <slot></slot>
    </span>
  </button>
</template>
<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";

@Component
export default class ButtonComponent extends Vue {
  @Prop({ type: Boolean, default: false }) loading: boolean;

  public click() {
    this.$emit("click");
  }
}
</script>