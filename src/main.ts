import { createApp } from "vue";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import "./style.css";
import App from "./App.vue";
import { createPinia } from "pinia";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.component("VueDatePicker", VueDatePicker);

app.mount("#app");
