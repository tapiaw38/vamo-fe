import { createApp } from "vue";
import { Quasar } from "quasar";
import langEs from "quasar/lang/es";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import "quasar/src/css/index.sass";

createApp(App).use(Quasar, { lang: langEs }).use(createPinia()).use(router).mount("#q-app");
