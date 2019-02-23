import Vue from "vue";
import { PluginObject } from "vue";
import loadingService from "./loading.service";

export interface ILoading {
  isOn: (name: string | string[]) => boolean;
  isOff: (name: string | string[]) => boolean;
  isAnyOn: (name: string | string[]) => boolean;
  isAnyOff: (name: string | string[]) => boolean;
  start: (name: string | string[]) => void;
  end: (name: string | string[]) => void;
}
declare module "vue/types/vue" {
  interface Vue { // tslint:disable-line:interface-name
    $loading: ILoading;
  }
  interface VueConstructor<V extends Vue = Vue> { // tslint:disable-line:interface-name
    loading: ILoading;
  }

}

const loading: PluginObject<undefined> = {
  install(vue: typeof Vue) {
    vue.prototype.$loading = vue.loading = {
      isOn: (name: string | string[]) => loadingService.isOn(name),
      isOff: (name: string | string[]) => loadingService.isOff(name),
      isAnyOn: (name: string | string[]) => loadingService.isAnyOn(name),
      isAnyOff: (name: string | string[]) => loadingService.isAnyOff(name),
      start: (name: string | string[]) => loadingService.start(name),
      end: (name: string | string[]) => loadingService.end(name),
    } as ILoading;
  },
};

export default loading;
