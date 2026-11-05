import { defineStore } from "pinia";
import { ref } from "vue";
import { rideRequestsService } from "../services/rideRequests/rideRequestsService";
import type { RideRequest, RideRequestInput, RideRequestQuote } from "../types/rideRequests";
export const useRideRequestsStore = defineStore("rideRequests", () => {
    const items = ref<RideRequest[]>([]);
    const current = ref<RideRequest | null>(null);
    const loading = ref(false);
    const create = async (input: RideRequestInput) => {
        loading.value = true;
        try {
            return await rideRequestsService.create(input);
        } finally {
            loading.value = false;
        }
    };
    const active = async () => {
        loading.value = true;
        try {
            current.value = await rideRequestsService.active();
            return current.value;
        } finally {
            loading.value = false;
        }
    };
    const recent = async () => rideRequestsService.recent();
    const list = async (origin: string, destination?: string) => {
        loading.value = true;
        try {
            items.value = await rideRequestsService.list(origin, destination);
        } finally {
            loading.value = false;
        }
    };
    const accept = async (id: string, vehicleID?: string) => {
        loading.value = true;
        try {
            return await rideRequestsService.accept(id, vehicleID);
        } finally {
            loading.value = false;
        }
    };
    const cancel = async (id: string) => {
        current.value = await rideRequestsService.cancel(id);
        return current.value;
    };
    const quote = async (
        origin: string,
        destination: string,
        coordinates?: {
            origin_lat: number;
            origin_lon: number;
            destination_lat: number;
            destination_lon: number;
        },
    ): Promise<RideRequestQuote> => rideRequestsService.quote(origin, destination, coordinates);
    return { items, current, loading, create, active, recent, list, accept, cancel, quote };
});
