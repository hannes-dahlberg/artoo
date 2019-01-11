<template>
  <div class="row justify-content-center">
    <div class="col-lg-5">
      <div class="card">
        <h5 class="card-header">Login</h5>
        <div class="card-body">
          <form v-on:submit.prevent="submit(form.email, form.password)">
            <div class="form-group">
              <label for="loginEmail">Email address</label>
              <input
                v-model="form.email"
                type="email"
                class="form-control"
                id="loginEmail"
                aria-describedby="emailHelp"
                placeholder="Enter email"
              >
            </div>
            <div class="form-group">
              <label for="loginPassword">Password</label>
              <input
                type="password"
                class="form-control"
                id="loginPassword"
                placeholder="Password"
                v-model="form.password"
              >
            </div>
            <div class="d-flex">
              <div>
                <button type="submit" class="btn btn-primary">Login</button>
              </div>
              <div class="form-group custom-control custom-checkbox ml-3 pt-2">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="loginRemember"
                  v-model="form.remember"
                >
                <label class="custom-control-label" for="loginRemember">Remember Me</label>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Route } from "vue-router";
import { State, Action, Getter } from "vuex-class";
import { loginActionCallback } from "../store/auth.store";

export interface User {
  emaiL: string;
  id: number;
}

export type loginForm = {
  email: string;
  password: string;
  remember: boolean;
};

@Component
export default class LoginComponent extends Vue {
  @Action("auth/login") login: loginActionCallback;
  @Getter("auth/token") token: string;
  @Getter("auth/user") user: User;

  public form: loginForm = {
    email: "",
    password: "",
    remember: false
  };

  public submit(email: string, password: string) {
    this.login({ email, password }).then(() => {
      this.$router.push("/timer");
    });
  }
}
</script>