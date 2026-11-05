import { storeToRefs } from "pinia";
import { useBookingsStore } from "../stores/bookingsStore";
export const useBookings = () => {
    const store = useBookingsStore();
    return {
        ...storeToRefs(store),
        mine: store.mine,
        loadReceived: store.loadReceived,
        create: store.create,
        cancel: store.cancel,
        confirm: store.confirm,
        reject: store.reject,
        rate: store.rate,
    };
};
