export interface RideRequest {
    id: string;
    passenger_id: string;
    origin_locality_id: string;
    destination_locality_id: string;
    origin_name?: string;
    destination_name?: string;
    origin_lat?: number;
    origin_lon?: number;
    destination_lat?: number;
    destination_lon?: number;
    origin_address?: string;
    destination_address?: string;
    requested_at: string;
    max_price_per_seat: string;
    seats: number;
    status: "open" | "accepted" | "cancelled" | "expired" | "completed";
    accepted_by_driver_profile_id?: string;
    accepted_trip_id?: string;
    notes: string;
    created_at?: string;
    accepted_driver_name?: string;
    accepted_driver_average_score?: number;
    accepted_driver_total_ratings?: number;
    accepted_vehicle_make?: string;
    accepted_vehicle_model?: string;
    accepted_vehicle_type?: string;
    accepted_vehicle_license_plate?: string;
}
export interface RideRequestInput {
    origin_locality_id: string;
    destination_locality_id: string;
    origin_lat?: number;
    origin_lon?: number;
    destination_lat?: number;
    destination_lon?: number;
    origin_address?: string;
    destination_address?: string;
    requested_at: string;
    max_price_per_seat?: string;
    seats?: number;
    notes?: string;
}
export interface RideRequestAccept {
    request: RideRequest;
    trip_id: string;
    booking_id: string;
}
export interface RideRequestQuote {
    distance_km: number;
    base_price: string;
    price_per_km: string;
    price_per_seat: string;
    currency: string;
    fare_kind: "urban" | "intercity";
}
export interface RideRequestRecent {
    destination_locality_id: string;
    destination_name: string;
    destination_address: string;
    destination_lat?: number;
    destination_lon?: number;
}
