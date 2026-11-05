import { configure } from "quasar/wrappers";

export default configure(() => ({
    boot: ["i18n", "api"],
    css: ["app.scss"],
    extras: ["roboto-font", "material-icons"],
    build: {
        target: { browser: ["es2022", "firefox115", "chrome115", "safari14"] },
        typescript: { strict: true },
    },
    devServer: { open: false, port: 9000, allowedHosts: [".ngrok-free.app"] },
    framework: { plugins: ["Notify"] },
    animations: [],
    ssr: { prodPort: 3000 },
    pwa: { workboxMode: "GenerateSW" },
    capacitor: { hideSplashscreen: true },
}));
