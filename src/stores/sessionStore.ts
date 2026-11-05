import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useSessionStore = defineStore("session", () => {
    const userId = ref<string | null>(null);
    const accessToken = ref<string | null>(null);
    const isAuthenticated = computed(() => userId.value !== null && accessToken.value !== null);

    const setSession = (nextUserId: string, nextAccessToken: string) => {
        userId.value = nextUserId;
        accessToken.value = nextAccessToken;
    };
    const clearSession = () => {
        userId.value = null;
        accessToken.value = null;
    };

    return { userId, accessToken, isAuthenticated, setSession, clearSession };
});
