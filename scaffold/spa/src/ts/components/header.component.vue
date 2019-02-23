<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <router-link :to="{ name: 'start' }" class="navbar-brand p-0">{{ $t('title') }}</router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul
          class="navbar-nav"
          :class="{ 'mr-auto': index === 0 }"
          v-for="(menu, index) in [leftMenu, rightMenu]"
          :key="index"
        >
          <li
            class="nav-item"
            v-bind:class="{ 'dropdown': menuItem.menu }"
            v-for="(menuItem, index) in menu"
            v-bind:key="index"
          >
            <template v-if="menuItem.menu">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >{{ menuItem.title }}</a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <router-link
                  class="dropdown-item"
                  v-for="(menuItem, index) in menuItem.menu"
                  :to="menuItem.route"
                  v-bind:key="index"
                >{{ menuItem.title }}</router-link>
              </div>
            </template>
            <template v-else>
              <router-link
                class="nav-link"
                v-bind:class="{ 'ml-auto': menuItem.route.name === 'logout'}"
                :to="menuItem.route"
              >
                {{ menuItem.title }}
                <span class="sr-only">(current)</span>
              </router-link>
            </template>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { State, Action, Getter } from "vuex-class";
import { IMenuItem } from "../store/menu.store";
@Component
export default class HeaderComponent extends Vue {
  @Getter("menu") menu: IMenuItem[];

  public get leftMenu(): IMenuItem[] {
    return this.menu.filter((menu: IMenuItem) => !menu.alignRight);
  }
  public get rightMenu(): IMenuItem[] {
    return this.menu.filter((menu: IMenuItem) => menu.alignRight);
  }
}
</script>