import { storeToRefs } from "pinia";
import { useDriversStore } from "../stores/driversStore";
export const useDrivers = () => {
    const store = useDriversStore();
    return { ...storeToRefs(store), load: store.load, save: store.save, setAvailability: store.setAvailability };
};
