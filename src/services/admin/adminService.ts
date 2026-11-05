import { api } from "../../boot/api";
import type { PricingInput, PricingSettings } from "../../types/pricing";
export type AdminRecord = Record<string, unknown>;
export const adminService = {
    async dashboard() {
        return (await api.get<{ data: Record<string, unknown> }>("/api/v1/admin/dashboard")).data
            .data;
    },
    async list(kind: string) {
        return (await api.get<{ data: AdminRecord[] }>(`/api/v1/admin/${kind}`)).data.data;
    },
    async verify(kind: string, id: string, status: "verified" | "suspended") {
        await api.post(`/api/v1/admin/verify/${kind}/${id}`, { status });
    },
    async pricing() {
        return (await api.get<{ data: PricingSettings }>("/api/v1/admin/pricing")).data.data;
    },
    async updatePricing(input: PricingInput) {
        return (await api.put<{ data: PricingSettings }>("/api/v1/admin/pricing", input)).data.data;
    },
};
