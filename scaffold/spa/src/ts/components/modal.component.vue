<template>
  <div class="modal" tabindex="-1" role="dialog" ref="modal">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <slot name="body"></slot>
        </div>
        <div class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import $ from "jquery";
import bootstrap from "bootstrap";
import { Vue, Component } from "vue-property-decorator";
@Component({
  props: {
    title: String
  }
})
export default class ModalComponent extends Vue {
  public mounted() {
    this.$on("show", () => {
      $(this.$refs.modal).modal("show");
    });
    this.$on("hide", () => {
      $(this.$refs.modal).modal("hide");
    });
  }
}
</script>