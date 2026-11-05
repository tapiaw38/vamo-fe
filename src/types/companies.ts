import type { Vehicle, VehicleInput } from "./vehicles";

export type Company = {
    id: string;
    legal_name: string;
    display_name: string;
    tax_id: string;
    province_id: string;
    locality_id: string;
    status: string;
    verification_status: string;
    contact_email: string;
    contact_phone: string;
    created_at: string;
    updated_at: string;
};
export type CompanyMember = {
    company_id: string;
    user_id: string;
    driver_profile_id?: string;
    role: "owner" | "admin" | "dispatcher" | "driver";
    status: string;
    created_at: string;
    updated_at: string;
};
export type CompanyInput = {
    legal_name: string;
    display_name: string;
    tax_id: string;
    province_id: string;
    locality_id: string;
    contact_email: string;
    contact_phone: string;
};
export type CompanyMemberInput = { user_id: string; role: CompanyMember["role"] };
export type CompanyVehicleInput = VehicleInput;
export type CompanyVehicle = Vehicle;
