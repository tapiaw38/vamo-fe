import { api } from "../../boot/api";
import type { AuthSession, AuthUser, LoginInput, RegisterInput } from "../../types/auth";

export const authService = {
    async login(input: LoginInput) {
        return (await api.post<AuthSession>("/auth/login", input)).data;
    },
    async register(input: RegisterInput) {
        return (await api.post<AuthSession>("/auth/register", input)).data;
    },
    async refresh(refreshToken: string) {
        return (await api.post<AuthSession>("/auth/refresh", { refresh_token: refreshToken })).data;
    },
    async logout() {
        await api.post("/auth/logout");
    },
    async me() {
        return (await api.get<{ data: AuthUser }>("/auth/me")).data.data;
    },
};
