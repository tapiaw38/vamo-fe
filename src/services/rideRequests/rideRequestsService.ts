import { api } from "../../boot/api";
import type {
    RideRequest,
    RideRequestAccept,
    RideRequestInput,
    RideRequestQuote,
    RideRequestRecent,
} from "../../types/rideRequests";
export const rideRequestsService = {
    async create(input: RideRequestInput) {
        return (await api.post<{ data: RideRequest }>("/api/v1/ride-requests", input)).data.data;
    },
    async active() {
        return (await api.get<{ data: RideRequest | null }>("/api/v1/ride-requests/active")).data.data;
    },
    async recent() {
        return (await api.get<{ data: RideRequestRecent[] }>("/api/v1/ride-requests/recent")).data.data;
    },
    async list(origin_locality_id: string, destination_locality_id?: string) {
        return (
            await api.get<{ data: RideRequest[] }>("/api/v1/ride-requests", {
                params: { origin_locality_id, destination_locality_id },
            })
        ).data.data;
    },
    async accept(id: string, vehicle_id?: string) {
        return (
            await api.post<{ data: RideRequestAccept }>(
                `/api/v1/ride-requests/${id}/accept`,
                vehicle_id ? { vehicle_id } : {},
            )
        ).data.data;
    },
    async cancel(id: string) {
        return (await api.post<{ data: RideRequest }>(`/api/v1/ride-requests/${id}/cancel`)).data
            .data;
    },
    async quote(origin_locality_id: string, destination_locality_id: string, coordinates?: { origin_lat: number; origin_lon: number; destination_lat: number; destination_lon: number }) {
        return (
            await api.get<{ data: RideRequestQuote }>("/api/v1/ride-requests/quote", {
                params: { origin_locality_id, destination_locality_id, ...coordinates },
            })
        ).data.data;
    },
};
