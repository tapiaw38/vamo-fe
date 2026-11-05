import { api } from "../../boot/api";
import type { DriverInput, DriverProfile } from "../../types/drivers";
export const driversService = {
    async getMe() {
        return (await api.get<{ data: DriverProfile }>("/api/v1/drivers/me")).data.data;
    },
    async save(input: DriverInput) {
        return (await api.patch<{ data: DriverProfile }>("/api/v1/drivers/me", input)).data.data;
    },
    async create(input: DriverInput) {
        return (await api.post<{ data: DriverProfile }>("/api/v1/drivers/profile", input)).data
            .data;
    },
    async setAvailability(is_available: boolean) {
        return (await api.patch<{ data: DriverProfile }>("/api/v1/drivers/me/availability", { is_available })).data.data;
    },
};
