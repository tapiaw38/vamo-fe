export type RouteField = "origin" | "destination";

export type RouteLocation = {
    id: string;
    name: string;
    address: string;
    lat?: number;
    lon?: number;
};

export type RouteSuggestion = Required<Pick<RouteLocation, "name" | "address" | "lat" | "lon">> & {
    id?: string;
};
