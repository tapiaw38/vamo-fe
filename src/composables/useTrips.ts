import { storeToRefs } from "pinia";
import { useTripsStore } from "../stores/tripsStore";
export const useTrips = () => {
    const store = useTripsStore();
    return {
        ...storeToRefs(store),
        search: store.search,
        load: store.load,
        create: store.create,
        mine: store.mine,
        cancel: store.cancel,
    };
};
