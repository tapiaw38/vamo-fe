export interface PricingSettings {
    base_price: string;
    price_per_km: string;
    urban_base_price: string;
    urban_price_per_km: string;
    currency: string;
    updated_at: string;
    updated_by?: string;
}

export type PricingInput = Omit<PricingSettings, "updated_at" | "updated_by">;
