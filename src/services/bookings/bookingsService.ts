import { api } from "../../boot/api";
import type { Booking } from "../../types/bookings";
export const bookingsService = {
    async create(tripID: string, seats: number) {
        return (await api.post<{ data: Booking }>(`/api/v1/trips/${tripID}/bookings`, { seats }))
            .data.data;
    },
    async mine(status?: string) {
        return (
            await api.get<{ data: Booking[] }>("/api/v1/bookings/mine", {
                params: status ? { status } : {},
            })
        ).data.data;
    },
    async received(status?: string) {
        return (
            await api.get<{ data: Booking[] }>("/api/v1/bookings/received", {
                params: status ? { status } : {},
            })
        ).data.data;
    },
    async get(id: string) {
        return (await api.get<{ data: Booking }>(`/api/v1/bookings/${id}`)).data.data;
    },
    async cancel(id: string) {
        return (await api.post<{ data: Booking }>(`/api/v1/bookings/${id}/cancel`)).data.data;
    },
    async confirm(id: string) {
        return (await api.post<{ data: Booking }>(`/api/v1/bookings/${id}/confirm`)).data.data;
    },
    async reject(id: string, reason = "") {
        return (await api.post<{ data: Booking }>(`/api/v1/bookings/${id}/reject`, { reason })).data
            .data;
    },
    async rate(id: string, score: number, comment?: string) {
        return (await api.post(`/api/v1/bookings/${id}/rating`, { score, comment })).data.data;
    },
};
