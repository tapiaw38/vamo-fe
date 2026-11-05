export type Province = { id: string; name: string; code: string };
export type Locality = {
    id: string;
    province_id: string;
    name: string;
    official_code: string;
    lat?: number;
    lon?: number;
};
export type ReverseGeocode = {
    address: string;
    street: string;
    house_number: string;
    locality_name: string;
};
export type GeocodeResult = ReverseGeocode & { lat: number; lon: number };
export type RouteResult = { coordinates: Array<[number, number]>; distance_m: number; duration_s: number };
