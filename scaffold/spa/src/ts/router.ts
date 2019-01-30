import VueRouter from "vue-router";

import { default as middlewares, guard } from "./middlewares";

import { ErrorComponent, LoginComponent } from "./components/";

export default new VueRouter({
  mode: "history",
  routes: [
    { path: "/error/:code", name: "error", component: ErrorComponent, beforeEnter: guard([middlewares.errorCode]) },
    { path: "/login", name: "login", component: LoginComponent, beforeEnter: guard([middlewares.guest]) },
    { path: "*", beforeEnter: guard([middlewares.invalidRoute]) },
  ],
});
