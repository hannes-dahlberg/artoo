import VueRouter from "vue-router";

import { default as middlewares, guard } from "./middlewares";

import { ErrorComponent, LoginComponent, StartComponent } from "./components/";

export default new VueRouter({
  mode: "history",
  routes: [
    { path: "/error/:code", name: "error", component: ErrorComponent, beforeEnter: guard([middlewares.errorCode]) },
    { path: "/start", name: "start", component: StartComponent },
    { path: "/login", name: "login", component: LoginComponent, beforeEnter: guard([middlewares.guest]) },
    { path: "/logout", name: "logout", beforeEnter: guard([middlewares.auth, middlewares.logout]) },
    { path: "*", beforeEnter: guard([middlewares.invalidRoute]) },
  ],
});
