import { storeToRefs } from "pinia";
import { useLocationsStore } from "../stores/locationsStore";
import { locationsService } from "../services/locations/locationsService";

export const useLocations = () => {
    const store = useLocationsStore();
    return {
        ...storeToRefs(store),
        loadProvinces: store.loadProvinces,
        loadLocalities: store.loadLocalities,
        loadOriginLocalities: store.loadOriginLocalities,
        loadDestinationLocalities: store.loadDestinationLocalities,
        search: store.search,
        nearest: store.nearest,
        reverse: (lat: number, lon: number, signal?: AbortSignal) =>
            locationsService.reverse(lat, lon, signal),
        forward: (query: string, lat?: number, lon?: number, signal?: AbortSignal) =>
            locationsService.forward(query, lat, lon, signal),
        route: (originLat: number, originLon: number, destinationLat: number, destinationLon: number, signal?: AbortSignal) =>
            locationsService.route(originLat, originLon, destinationLat, destinationLon, signal),
    };
};
