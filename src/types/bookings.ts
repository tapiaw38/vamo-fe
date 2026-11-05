export type BookingStatus =
    "pending" | "confirmed" | "rejected" | "cancelled" | "expired" | "completed";
export interface BookingTrip {
    id: string;
    origin_name: string;
    destination_name: string;
    driver_name: string;
    vehicle_make: string;
    vehicle_model: string;
    price_per_seat: string;
    currency: string;
    status: string;
    departure_at: string;
    available_seats: number;
    total_seats: number;
}
export interface Booking {
    id: string;
    trip_id: string;
    passenger_id: string;
    seats: number;
    unit_price_snapshot: string;
    total_price: string;
    currency: string;
    status: BookingStatus;
    requested_at: string;
    confirmed_at?: string;
    cancelled_at?: string;
    expires_at?: string;
    trip?: BookingTrip;
    rated: boolean;
    can_rate: boolean;
}
