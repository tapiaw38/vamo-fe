import { api } from "../../boot/api";
import type {
    Company,
    CompanyInput,
    CompanyMember,
    CompanyMemberInput,
    CompanyVehicle,
    CompanyVehicleInput,
} from "../../types/companies";

type Raw = Record<string, any>;
const company = (item: Raw): Company => ({
    id: item.id ?? item.ID,
    legal_name: item.legal_name ?? item.LegalName,
    display_name: item.display_name ?? item.DisplayName,
    tax_id: item.tax_id ?? item.TaxID,
    province_id: item.province_id ?? item.ProvinceID,
    locality_id: item.locality_id ?? item.LocalityID,
    status: item.status ?? item.Status,
    verification_status: item.verification_status ?? item.VerificationStatus,
    contact_email: item.contact_email ?? item.ContactEmail,
    contact_phone: item.contact_phone ?? item.ContactPhone,
    created_at: item.created_at ?? item.CreatedAt,
    updated_at: item.updated_at ?? item.UpdatedAt,
});
const member = (item: Raw): CompanyMember => ({
    company_id: item.company_id ?? item.CompanyID,
    user_id: item.user_id ?? item.UserID,
    driver_profile_id: item.driver_profile_id ?? item.DriverProfileID,
    role: item.role ?? item.Role,
    status: item.status ?? item.Status,
    created_at: item.created_at ?? item.CreatedAt,
    updated_at: item.updated_at ?? item.UpdatedAt,
});
const vehicle = (item: Raw): CompanyVehicle => ({
    id: item.id ?? item.ID,
    owner_type: item.owner_type ?? item.OwnerType,
    driver_profile_id: item.driver_profile_id ?? item.DriverProfileID,
    company_id: item.company_id ?? item.CompanyID,
    make: item.make ?? item.Make,
    model: item.model ?? item.Model,
    year: item.year ?? item.Year,
    license_plate: item.license_plate ?? item.LicensePlate,
    authorized_seats: item.authorized_seats ?? item.AuthorizedSeats,
    vehicle_type: item.vehicle_type ?? item.VehicleType,
    photo_url: item.photo_url ?? item.PhotoURL,
    verification_status: item.verification_status ?? item.VerificationStatus,
    active: item.active ?? item.Active,
});

export const companiesService = {
    async list() {
        const response = await api.get<{ data: Raw[] }>("/api/v1/companies");
        return response.data.data.map(company);
    },
    async get(id: string) {
        const response = await api.get<{ data: Raw }>(`/api/v1/companies/${id}`);
        return company(response.data.data);
    },
    async create(input: CompanyInput) {
        const response = await api.post<{ data: Raw }>("/api/v1/companies", input);
        return company(response.data.data);
    },
    async update(id: string, input: CompanyInput) {
        const response = await api.patch<{ data: Raw }>(`/api/v1/companies/${id}`, input);
        return company(response.data.data);
    },
    async members(id: string) {
        const response = await api.get<{ data: Raw[] }>(`/api/v1/companies/${id}/members`);
        return response.data.data.map(member);
    },
    async addMember(id: string, input: CompanyMemberInput) {
        await api.post(`/api/v1/companies/${id}/members`, input);
    },
    async removeMember(id: string, userID: string) {
        await api.delete(`/api/v1/companies/${id}/members/${userID}`);
    },
    async vehicles(id: string) {
        const response = await api.get<{ data: Raw[] }>(`/api/v1/companies/${id}/vehicles`);
        return response.data.data.map(vehicle);
    },
    async addVehicle(id: string, input: CompanyVehicleInput) {
        const response = await api.post<{ data: Raw }>(`/api/v1/companies/${id}/vehicles`, input);
        return vehicle(response.data.data);
    },
};
