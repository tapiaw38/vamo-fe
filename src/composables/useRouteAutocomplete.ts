import { onBeforeUnmount, ref } from "vue";
import { useLocations } from "./useLocations";
import type { RouteField, RouteSuggestion } from "../types/routeLocation";

const fallbackPosition = { lat: -38.4161, lon: -63.6167 };

const haversine = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
    const radians = Math.PI / 180;
    const dLat = (b.lat - a.lat) * radians;
    const dLon = (b.lon - a.lon) * radians;
    const value =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(a.lat * radians) * Math.cos(b.lat * radians) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

export const useRouteAutocomplete = (provinceName: (id: string) => string) => {
    const locations = useLocations();
    const suggestions = ref<RouteSuggestion[]>([]);
    const searching = ref(false);
    const currentPosition = ref<{ lat: number; lon: number } | null>(null);
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    let version = 0;

    const search = (query: string, _field: RouteField) => {
        if (timer) clearTimeout(timer);
        controller?.abort();
        if (query.trim().length < 2) {
            suggestions.value = [];
            return;
        }
        timer = setTimeout(async () => {
            const requestVersion = ++version;
            controller = new AbortController();
            searching.value = true;
            const bias = currentPosition.value || fallbackPosition;
            const [localities, geocodes] = await Promise.allSettled([
                locations.search(query),
                locations.forward(query, bias.lat, bias.lon, controller.signal),
            ]);
            if (requestVersion !== version) return;
            const localitySuggestions: RouteSuggestion[] =
                localities.status === "fulfilled"
                    ? localities.value.map((item) => ({
                          id: item.id,
                          name: item.name,
                          address: provinceName(item.province_id),
                          lat: item.lat ?? bias.lat,
                          lon: item.lon ?? bias.lon,
                      }))
                    : [];
            const geocodeSuggestions: RouteSuggestion[] =
                geocodes.status === "fulfilled"
                    ? geocodes.value.map((item) => {
                          const parts = item.address.split(",").map((part) => part.trim());
                          const name = item.street
                              ? `${item.street} ${item.house_number}`.trim()
                              : parts[0];
                          return {
                              name,
                              address: item.locality_name || parts.slice(1, 3).join(", ") || name,
                              lat: item.lat,
                              lon: item.lon,
                          };
                      })
                    : [];
            const all = [...localitySuggestions, ...geocodeSuggestions];
            suggestions.value = all
                .filter(
                    (item, index) =>
                        all.findIndex(
                            (other) =>
                                other.name === item.name &&
                                Math.abs(other.lat - item.lat) < 0.0001 &&
                                Math.abs(other.lon - item.lon) < 0.0001,
                        ) === index,
                )
                .sort((a, b) =>
                    currentPosition.value
                        ? haversine(currentPosition.value, a) - haversine(currentPosition.value, b)
                        : 0,
                )
                .slice(0, 6);
            searching.value = false;
        }, 400);
    };

    const distance = (item: RouteSuggestion) =>
        currentPosition.value ? `${haversine(currentPosition.value, item).toFixed(1)} km` : "";
    const clear = () => {
        suggestions.value = [];
        controller?.abort();
    };

    onBeforeUnmount(() => {
        if (timer) clearTimeout(timer);
        controller?.abort();
    });

    return { currentPosition, suggestions, searching, search, distance, clear };
};
