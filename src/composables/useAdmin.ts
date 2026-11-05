import { storeToRefs } from "pinia";
import { useAdminStore } from "../stores/adminStore";
export const useAdmin = () => {
    const store = useAdminStore();
    return {
        ...storeToRefs(store),
        loadDashboard: store.loadDashboard,
        load: store.load,
        verify: store.verify,
        loadPricing: store.loadPricing,
        updatePricing: store.updatePricing,
    };
};
