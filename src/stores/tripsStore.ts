import { defineStore } from "pinia";
import { ref } from "vue";
import { tripsService } from "../services/trips/tripsService";
import type { Trip, TripInput, TripSearchParams } from "../types/trips";
export const useTripsStore = defineStore("trips", () => {
    const items = ref<Trip[]>([]);
    const current = ref<Trip | null>(null);
    const loading = ref(false);
    const search = async (params: TripSearchParams) => {
        loading.value = true;
        try {
            items.value = await tripsService.search(params);
        } finally {
            loading.value = false;
        }
    };
    const load = async (id: string) => {
        loading.value = true;
        try {
            current.value = await tripsService.get(id);
        } finally {
            loading.value = false;
        }
    };
    const create = async (input: TripInput) => {
        loading.value = true;
        try {
            return await tripsService.create(input);
        } finally {
            loading.value = false;
        }
    };
    const mine = async (status?: string) => {
        loading.value = true;
        try {
            items.value = await tripsService.mine(status);
        } finally {
            loading.value = false;
        }
    };
    const cancel = async (id: string) => {
        current.value = await tripsService.cancel(id);
        items.value = items.value.map((item) => (item.id === id ? (current.value as Trip) : item));
    };
    return { items, current, loading, search, load, create, mine, cancel };
});
