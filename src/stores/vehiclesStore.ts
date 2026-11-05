import { defineStore } from "pinia";
import { ref } from "vue";
import { vehiclesService } from "../services/vehicles/vehiclesService";
import type { Vehicle, VehicleInput } from "../types/vehicles";
export const useVehiclesStore = defineStore("vehicles", () => {
    const items = ref<Vehicle[]>([]);
    const loading = ref(false);
    const load = async () => {
        loading.value = true;
        try {
            items.value = await vehiclesService.list();
        } finally {
            loading.value = false;
        }
    };
    const create = async (input: VehicleInput) => {
        loading.value = true;
        try {
            const item = await vehiclesService.create(input);
            items.value.unshift(item);
        } finally {
            loading.value = false;
        }
    };
    const update = async (id: string, input: VehicleInput) => {
        loading.value = true;
        try {
            const item = await vehiclesService.update(id, input);
            items.value = items.value.map((current) => (current.id === id ? item : current));
            return item;
        } finally {
            loading.value = false;
        }
    };
    return { items, loading, load, create, update };
});
