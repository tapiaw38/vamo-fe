import { defineStore } from "pinia";
import { ref } from "vue";
import { adminService, type AdminRecord } from "../services/admin/adminService";
import type { PricingInput, PricingSettings } from "../types/pricing";
export const useAdminStore = defineStore("admin", () => {
    const dashboard = ref<Record<string, unknown>>({});
    const rows = ref<AdminRecord[]>([]);
    const loading = ref(false);
    const pricing = ref<PricingSettings | null>(null);
    const loadDashboard = async () => {
        dashboard.value = await adminService.dashboard();
    };
    const load = async (kind: string) => {
        loading.value = true;
        try {
            rows.value = await adminService.list(kind);
        } finally {
            loading.value = false;
        }
    };
    const verify = async (kind: string, id: string, status: "verified" | "suspended") => {
        await adminService.verify(kind, id, status);
    };
    const loadPricing = async () => {
        pricing.value = await adminService.pricing();
    };
    const updatePricing = async (input: PricingInput) => {
        pricing.value = await adminService.updatePricing(input);
        return pricing.value;
    };
    return {
        dashboard,
        rows,
        loading,
        pricing,
        loadDashboard,
        load,
        verify,
        loadPricing,
        updatePricing,
    };
});
