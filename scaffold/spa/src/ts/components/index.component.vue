<template>
  <div class="container mt-5" v-if="!loading">
    <router-view></router-view>
  </div>
  <div v-else>
    <h1>Loading...</h1>
  </div>
</template>
<script lang = "ts" >
import { Vue, Component } from "vue-property-decorator";
import { State, Action, Getter } from "vuex-class";
import { broadcast } from "../utils/broadcast";

import { IErrorPayload, subscribeActionCallback } from "../store/error.store";

@Component
export default class IndexComponent extends Vue {
  @Action("error/subscribe") errorSubscribe: subscribeActionCallback;
  @Action("auth/setAxiosHeaders") setAxiosHeaders: () => any;
  @Action("auth/setAxiosInterceptors") setAxiosInterceptors: () => any;

  public loading: boolean = false;

  public created() {
    this.setAxiosHeaders();
    this.setAxiosInterceptors();
  }
  public mounted() {
    this.errorSubscribe((payload: IErrorPayload) => {
      console.log("SOMETHING WENT WRONG", payload);
    });
    broadcast.subscribe("logout").then(() => {
      this.$router.push({ name: "login" });
    });
  }
}
</script>