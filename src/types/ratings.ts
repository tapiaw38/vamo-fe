export interface RatingInput {
    score: number;
    comment?: string;
}

export interface DriverRating {
    average_score?: number;
    total_ratings: number;
}

export interface TripRating {
    id: string;
    trip_id: string;
    booking_id: string;
    score: number;
    comment?: string;
}
