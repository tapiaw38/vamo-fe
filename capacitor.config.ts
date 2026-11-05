import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ar.vamo.app",
  appName: "VAMO!",
  webDir: "dist/spa",
  server: { androidScheme: "https" },
  plugins: { SplashScreen: { launchAutoHide: true } },
};

export default config;
