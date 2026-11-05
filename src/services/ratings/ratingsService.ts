import { api } from "../../boot/api";
import type { DriverRating, RatingInput, TripRating } from "../../types/ratings";

export const ratingsService = {
    async create(bookingID: string, input: RatingInput) {
        return (await api.post<{ data: TripRating }>(`/api/v1/bookings/${bookingID}/rating`, input)).data.data;
    },
    async driver(driverID: string) {
        return (await api.get<{ data: DriverRating }>(`/api/v1/drivers/${driverID}/rating`)).data.data;
    },
};
