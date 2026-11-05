import { defineStore } from "pinia";
import { ref } from "vue";
import { locationsService } from "../services/locations/locationsService";
import type { Locality, Province } from "../types/locations";

export const useLocationsStore = defineStore("locations", () => {
    const provinces = ref<Province[]>([]);
    const localities = ref<Locality[]>([]);
    const originLocalities = ref<Locality[]>([]);
    const destinationLocalities = ref<Locality[]>([]);
    const loading = ref(false);
    const loadProvinces = async () => {
        loading.value = true;
        try {
            provinces.value = await locationsService.provinces();
        } finally {
            loading.value = false;
        }
    };
    const loadLocalities = async (provinceID: string) => {
        localities.value = provinceID ? await locationsService.localities(provinceID) : [];
    };
    const search = async (query: string) => {
        if (!query) return localities.value;
        const results = await locationsService.search(query);
        localities.value = results;
        return results;
    };
    const nearest = async (lat: number, lon: number) => locationsService.nearest(lat, lon);
    const loadOriginLocalities = async (provinceID: string) => {
        originLocalities.value = provinceID ? await locationsService.localities(provinceID) : [];
    };
    const loadDestinationLocalities = async (provinceID: string) => {
        destinationLocalities.value = provinceID
            ? await locationsService.localities(provinceID)
            : [];
    };
    return {
        provinces,
        localities,
        originLocalities,
        destinationLocalities,
        loading,
        loadProvinces,
        loadLocalities,
        loadOriginLocalities,
        loadDestinationLocalities,
        search,
        nearest,
    };
});
