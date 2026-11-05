import { defineStore } from "pinia";
import { ref } from "vue";
import { driversService } from "../services/drivers/driversService";
import type { DriverInput, DriverProfile } from "../types/drivers";
export const useDriversStore = defineStore("drivers", () => {
    const profile = ref<DriverProfile | null>(null);
    const loading = ref(false);
    const load = async () => {
        loading.value = true;
        try {
            profile.value = await driversService.getMe();
        } finally {
            loading.value = false;
        }
    };
    const save = async (input: DriverInput) => {
        loading.value = true;
        try {
            profile.value = await driversService.save(input);
        } finally {
            loading.value = false;
        }
    };
    const setAvailability = async (isAvailable: boolean) => {
        loading.value = true;
        try { profile.value = await driversService.setAvailability(isAvailable); } finally { loading.value = false; }
    };
    return { profile, loading, load, save, setAvailability };
});
