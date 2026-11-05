export interface Trip {
    id: string;
    publisher_type: string;
    driver_profile_id: string;
    vehicle_id: string;
    origin_locality_id: string;
    destination_locality_id: string;
    origin_name: string;
    destination_name: string;
    driver_name: string;
    average_score?: number;
    total_ratings?: number;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_type: string;
    vehicle_license_plate?: string;
    vehicle_photo_url?: string;
    departure_at: string;
    arrival_at?: string;
    timezone: string;
    price_per_seat: string;
    currency: string;
    booking_mode: "automatic" | "manual";
    status: string;
    notes: string;
    total_seats: number;
    available_seats: number;
}
export interface TripInput {
	 publisher_type?: "driver" | "company";
	 company_id?: string;
	 driver_profile_id?: string;
    vehicle_id: string;
    origin_locality_id: string;
    destination_locality_id: string;
    departure_at: string;
    arrival_at?: string;
    timezone?: string;
    price_per_seat: string;
    currency?: string;
    total_seats: number;
    booking_mode: "automatic" | "manual";
    notes?: string;
}
export interface TripSearchParams {
    origin_locality_id?: string;
    destination_locality_id?: string;
    date?: string;
    passengers?: number;
    vehicle_type?: string;
    page?: number;
    page_size?: number;
}
