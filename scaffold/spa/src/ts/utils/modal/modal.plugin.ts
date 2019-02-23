import Vue from "vue";
import { PluginObject } from "vue";

import { i18n } from "../../locale";
import { appStore as store } from "../../store";

import ModalComponent from "./modal";

export interface IModalOptions {
  beforeOpen?: (instance: Vue) => Promise<void>;
  beforeClose?: (instance: Vue) => Promise<void>;
  beforeHide?: (instance: Vue) => Promise<void>;
}
export interface IModalResponse<T> { type: "close" | "hide"; data: T; }
export interface IModal {
  init<T, C>({ component, data, options }: { component: typeof Vue, data?: T, options?: IModalOptions }): Promise<IModalResponse<T>>;
}

declare module "vue/types/vue" {
  interface Vue { // tslint:disable-line:interface-name
    $modal: IModal;
  }
  interface VueConstructor<V extends Vue = Vue> { // tslint:disable-line:interface-name
    modal: IModal;
  }
}

const modal: PluginObject<undefined> = {
  install(vue: typeof Vue) {

    vue.prototype.$modal = vue.modal = {
      init<T, C>({ component, data, options }: { component: typeof Vue, data?: T, options?: IModalOptions }): Promise<IModalResponse<C>> {
        return new Promise((resolve, reject) => {
          const modalComponent = new (vue.extend(ModalComponent))({
            props: {
              data,
              options: options as any,
              component,
            },
            el: document.createElement("div"),
            store,
            i18n,
          });

          if (data !== undefined) {
            modalComponent.$props.data = data;
          }
          if (options !== undefined) {
            modalComponent.$props.options = options;
          }

          modalComponent.$props.component = component;

          modalComponent.$on("close", (data: C) => {
            resolve({ type: "close", data });
          });
          modalComponent.$on("hide", (data: any) => {
            resolve({ type: "hide", data });
          });
        });
      },
    };
  },
};

export default modal;
