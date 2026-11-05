import { storeToRefs } from "pinia";
import { useVehiclesStore } from "../stores/vehiclesStore";
export const useVehicles = () => {
    const store = useVehiclesStore();
    return { ...storeToRefs(store), load: store.load, create: store.create, update: store.update };
};
