import { Capacitor } from "@capacitor/core";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";

const key = "vamo.session";
type Session = { userId: string; accessToken: string; refreshToken?: string };

// ponytail: localStorage on web, not a HttpOnly cookie — that needs a gateway/backend
// redesign (CSRF, Set-Cookie flow). Same XSS exposure the app already has without a
// strict CSP; revisit if VAMO adds a backend-for-frontend.
export const secureSession = {
    async save(session: Session) {
        if (Capacitor.isNativePlatform()) {
            await SecureStorage.set(key, session);
            return;
        }
        localStorage.setItem(key, JSON.stringify(session));
    },
    async load(): Promise<Session | null> {
        if (Capacitor.isNativePlatform()) return (await SecureStorage.get(key)) as Session | null;
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        try {
            return JSON.parse(raw) as Session;
        } catch {
            localStorage.removeItem(key);
            return null;
        }
    },
    async clear() {
        if (Capacitor.isNativePlatform()) {
            await SecureStorage.remove(key);
            return;
        }
        localStorage.removeItem(key);
    },
};
