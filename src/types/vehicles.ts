export interface Vehicle {
    id: string;
    owner_type: "driver" | "company";
    driver_profile_id?: string;
    company_id?: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
    authorized_seats: number;
    vehicle_type: string;
    photo_url?: string;
    verification_status: string;
    active: boolean;
}
export interface VehicleInput {
    make: string;
    model: string;
    year: number;
    license_plate: string;
    authorized_seats: number;
    vehicle_type: string;
    photo_url?: string;
}
