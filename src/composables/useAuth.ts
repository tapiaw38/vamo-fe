import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/authStore";

export const useAuth = () => {
    const store = useAuthStore();
    const refs = storeToRefs(store);
    return {
        ...refs,
        login: store.login,
        register: store.register,
        logout: store.logout,
        bootstrap: store.bootstrap,
    };
};
