import { storeToRefs } from "pinia";
import { useSessionStore } from "../stores/sessionStore";

export const useSession = () => {
    const store = useSessionStore();
    const { userId, accessToken, isAuthenticated } = storeToRefs(store);
    return {
        userId,
        accessToken,
        isAuthenticated,
        setSession: store.setSession,
        clearSession: store.clearSession,
    };
};
