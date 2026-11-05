import { api } from "../../boot/api";
import type { Trip, TripInput, TripSearchParams } from "../../types/trips";
export const tripsService = {
    async search(params: TripSearchParams) {
        return (await api.get<{ data: Trip[] }>("/api/v1/trips", { params })).data.data;
    },
    async get(id: string) {
        return (await api.get<{ data: Trip }>(`/api/v1/trips/${id}`)).data.data;
    },
    async create(input: TripInput) {
        return (await api.post<{ data: Trip }>("/api/v1/trips", input)).data.data;
    },
    async mine(status?: string) {
        return (
            await api.get<{ data: Trip[] }>("/api/v1/trips/mine", {
                params: status ? { status } : {},
            })
        ).data.data;
    },
    async update(id: string, input: TripInput) {
        return (await api.patch<{ data: Trip }>(`/api/v1/trips/${id}`, input)).data.data;
    },
    async cancel(id: string) {
        return (await api.post<{ data: Trip }>(`/api/v1/trips/${id}/cancel`)).data.data;
    },
};
