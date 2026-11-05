import { storeToRefs } from "pinia";
import { useRideRequestsStore } from "../stores/rideRequestsStore";
export const useRideRequests = () => {
    const store = useRideRequestsStore();
    return {
        ...storeToRefs(store),
        create: store.create,
        active: store.active,
        recent: store.recent,
        list: store.list,
        accept: store.accept,
        cancel: store.cancel,
        quote: store.quote,
    };
};
