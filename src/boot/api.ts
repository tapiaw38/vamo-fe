import { boot } from "quasar/wrappers";
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_GATEWAY_URL ?? "http://localhost:8081",
    timeout: 10000,
});

export default boot(({ app }) => {
    app.config.globalProperties.$api = api;
});

export { api };
