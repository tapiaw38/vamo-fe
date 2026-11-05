import { api } from "../../boot/api";
import type { Vehicle, VehicleInput } from "../../types/vehicles";
export const vehiclesService = {
    async list() {
        return (await api.get<{ data: Vehicle[] }>("/api/v1/vehicles")).data.data;
    },
    async get(id: string) {
        return (await api.get<{ data: Vehicle }>(`/api/v1/vehicles/${id}`)).data.data;
    },
    async create(input: VehicleInput) {
        return (await api.post<{ data: Vehicle }>("/api/v1/vehicles", input)).data.data;
    },
    async update(id: string, input: VehicleInput) {
        return (await api.patch<{ data: Vehicle }>(`/api/v1/vehicles/${id}`, input)).data.data;
    },
};
