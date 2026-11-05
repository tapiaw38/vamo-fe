import { api } from "../../boot/api";
import type { GeocodeResult, Locality, Province, ReverseGeocode, RouteResult } from "../../types/locations";

export const locationsService = {
    async provinces() {
        return (await api.get<{ data: Province[] }>("/api/v1/provinces")).data.data;
    },
    async localities(provinceID: string) {
        return (await api.get<{ data: Locality[] }>(`/api/v1/provinces/${provinceID}/localities`))
            .data.data;
    },
    async search(query: string) {
        return (
            await api.get<{ data: Locality[] }>("/api/v1/localities/search", {
                params: { q: query },
            })
        ).data.data;
    },
    async nearest(lat: number, lon: number) {
        return (
            await api.get<{ data: Locality }>("/api/v1/localities/nearest", {
                params: { lat, lon },
            })
        ).data.data;
    },
    async reverse(lat: number, lon: number, signal?: AbortSignal) {
        return (
            await api.get<{ data: ReverseGeocode }>("/api/v1/geocode/reverse", {
                params: { lat, lon },
                signal,
            })
        ).data.data;
    },
    async forward(query: string, lat = 0, lon = 0, signal?: AbortSignal) {
        return (await api.get<{ data: GeocodeResult[] }>("/api/v1/geocode/search", { params: { q: query, lat, lon }, signal })).data.data;
    },
    async route(originLat: number, originLon: number, destinationLat: number, destinationLon: number, signal?: AbortSignal) {
        return (await api.get<{ data: RouteResult }>("/api/v1/geocode/route", { params: { origin_lat: originLat, origin_lon: originLon, destination_lat: destinationLat, destination_lon: destinationLon }, signal })).data.data;
    },
};
