<template>
  <div>
    <div class="modal-header">{{ data.title }}</div>
    <div class="modal-body">{{ data.message }}</div>
    <div class="modal-footer">
      <buttonComponent
        type="button"
        class="btn btn-secondary"
        :loading="loadingCancel"
        :disabled="loadingCancel || loadingConfirm"
        v-on:click="cancel"
      >{{ $t(data.type === 'confirm' ? 'confirm.cancel' : 'confirm.no') }}</buttonComponent>
      <buttonComponent
        type="submit"
        class="btn btn-primary"
        :loading="loadingConfirm"
        :disabled="loadingConfirm || loadingCancel"
        v-on:click="confirm"
      >{{ $t(data.type === 'confirm' ? 'confirm.ok' : 'confirm.yes') }}</buttonComponent>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { IModalOptions } from "../utils/modal/modal";
import ButtonComponent from "./button.component";

export type confirmModalData = {
  type: "confirm" | "yesno";
  title: string;
  message: string;
};
export const confirmModalInit = (
  data: confirmModalData,
  options?: IModalOptions
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    Vue.modal
      .init({
        component: ConfirmModalComponent,
        data,
        ...(options !== undefined ? { options } : null)
      })
      .then((result: any) => {
        if (result.type === "close") {
          resolve();
        } else {
          reject();
        }
      });
  });
};

@Component({
  components: { ButtonComponent }
})
export default class ConfirmModalComponent extends Vue {
  @Prop({ type: Object, default: null }) data: confirmModalData;
  @Prop({ type: Object, default: undefined }) options: IModalOptions;

  public loadingConfirm: boolean = false;
  public loadingCancel: boolean = false;

  mounted() {
    if (this.options !== undefined && this.options.beforeOpen !== undefined) {
      this.options.beforeOpen(this).then(() => this.$emit("open"));
    } else {
      this.$emit("open");
    }
  }

  confirm() {
    if (this.options !== undefined && this.options.beforeClose) {
      this.loadingConfirm = true;
      this.options.beforeClose(this).then(() => this.$emit("close"));
    } else {
      this.$emit("close");
    }
  }
  cancel() {
    if (this.options !== undefined && this.options.beforeHide) {
      this.loadingCancel = true;
      this.options.beforeHide(this).then(() => this.$emit("hide"));
    } else {
      this.$emit("hide");
    }
  }
}
</script>