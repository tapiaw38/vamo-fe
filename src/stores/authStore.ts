import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authService } from "../services/auth/authService";
import { api } from "../boot/api";
import type { LoginInput, RegisterInput } from "../types/auth";
import { secureSession } from "../services/session/secureSession";
import type { AuthUser } from "../types/auth";

export const useAuthStore = defineStore("auth", () => {
    const userId = ref<string | null>(null);
    const accessToken = ref<string | null>(null);
    const refreshToken = ref<string | null>(null);
    const currentUser = ref<AuthUser | null>(null);
    const loading = ref(false);
    const isAuthenticated = computed(() => Boolean(userId.value && accessToken.value));

    const applySession = async (session: {
        data: AuthUser;
        token: string;
        refresh_token?: string;
    }) => {
        currentUser.value = session.data;
        userId.value = session.data.id;
        accessToken.value = session.token;
        refreshToken.value = session.refresh_token ?? null;
        api.defaults.headers.common.Authorization = `Bearer ${session.token}`;
        await secureSession.save({
            userId: userId.value,
            accessToken: session.token,
            refreshToken: refreshToken.value ?? undefined,
        });
    };
    const login = async (input: LoginInput) => {
        loading.value = true;
        try {
            await applySession(await authService.login(input));
        } finally {
            loading.value = false;
        }
    };
    const register = async (input: RegisterInput) => {
        loading.value = true;
        try {
            const {
                residence_locality_id: localityID,
                wants_to_be_driver: wantsToBeDriver,
                email,
                password,
                ...authInput
            } = input;
            await authService.register({
                ...authInput,
                email,
                password,
                wants_to_be_driver: wantsToBeDriver,
            });
            await applySession(await authService.login({ email, password }));
            if (localityID)
                await api.patch("/api/v1/users/me", { residence_locality_id: localityID });
        } finally {
            loading.value = false;
        }
    };
    const logout = async () => {
        try {
            await authService.logout();
        } finally {
            await secureSession.clear();
            currentUser.value = null;
            userId.value = null;
            accessToken.value = null;
            refreshToken.value = null;
            delete api.defaults.headers.common.Authorization;
        }
    };
    const bootstrap = async () => {
        if (!accessToken.value) {
            const stored = await secureSession.load();
            if (!stored) return false;
            userId.value = stored.userId;
            accessToken.value = stored.accessToken;
            refreshToken.value = stored.refreshToken ?? null;
            api.defaults.headers.common.Authorization = `Bearer ${stored.accessToken}`;
        }
        try {
            const user = await authService.me();
            currentUser.value = user;
            userId.value = user.id;
            return true;
        } catch {
            await logout();
            return false;
        }
    };
    // The access token lives 15 minutes. Without this the session dies silently and every
    // request 401s, so renew once with the refresh token and replay the failed request.
    const renewable = (url?: string) =>
        !["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"].includes(url ?? "");
    let renewal: Promise<void> | null = null;
    const renew = () => {
        if (!renewal) {
            const token = refreshToken.value;
            renewal = (async () => {
                if (!token) throw new Error("missing refresh token");
                await applySession(await authService.refresh(token));
            })().finally(() => {
                renewal = null;
            });
        }
        return renewal;
    };
    api.interceptors.response.use(undefined, async (error: AxiosError) => {
        const request = error.config as
            (InternalAxiosRequestConfig & { retried?: boolean }) | undefined;
        if (
            error.response?.status !== 401 ||
            !request ||
            request.retried ||
            !renewable(request.url)
        )
            throw error;
        request.retried = true;
        try {
            await renew();
        } catch {
            await logout();
            // ponytail: hard redirect, because a request failing mid-page triggers no navigation
            // and the router guard only runs on navigation.
            if (window.location.pathname !== "/login") window.location.assign("/login");
            throw error;
        }
        request.headers.Authorization = api.defaults.headers.common.Authorization as string;
        return api.request(request);
    });

    return {
        userId,
        accessToken,
        refreshToken,
        currentUser,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        bootstrap,
    };
});
