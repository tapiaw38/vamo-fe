<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { useQuasar } from "quasar";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLocations } from "../composables/useLocations";

type LocalitySelection = { id: string; name: string; address: string; lat: number; lon: number };

const props = withDefaults(
    defineProps<{
        originLabel?: string;
        destinationLabel?: string;
        activeKind?: "origin" | "destination" | null;
        showLocations?: boolean;
        mapHeight?: string;
        readonly?: boolean;
        initialOrigin?: { lat: number; lon: number };
        initialDestination?: { lat: number; lon: number };
        routeCoordinates?: Array<[number, number]>;
    }>(),
    {
        originLabel: "Punto de partida",
        destinationLabel: "Destino",
        activeKind: null,
        showLocations: true,
        mapHeight: "320px",
        readonly: false,
        initialOrigin: undefined,
        initialDestination: undefined,
        routeCoordinates: undefined,
    },
);

const emit = defineEmits<{
    origin: [selection: LocalitySelection];
    destination: [selection: LocalitySelection];
}>();

const quasar = useQuasar();
const locations = useLocations();
const mapElement = ref<HTMLElement | null>(null);
const map = shallowRef<L.Map | null>(null);
const originMarker = shallowRef<L.Marker | null>(null);
const destinationMarker = shallowRef<L.Marker | null>(null);
const routeLine = shallowRef<L.Polyline | null>(null);
const originName = ref("");
const destinationName = ref("");
const resolveTimers: Partial<Record<"origin" | "destination", ReturnType<typeof setTimeout>>> = {};
const resolveControllers: Partial<Record<"origin" | "destination", AbortController>> = {};
const resolveVersions = { origin: 0, destination: 0 };
const defaultCenter: L.LatLngExpression = [-38.4161, -63.6167];

const drawRoute = () => {
    routeLine.value?.remove();
    if (!map.value || !props.routeCoordinates?.length) return;
    const color =
        getComputedStyle(document.documentElement).getPropertyValue("--vamo-blue").trim() ||
        "#C73D17";
    routeLine.value = L.polyline(props.routeCoordinates, { color, weight: 4, opacity: 0.85 }).addTo(
        map.value,
    );
    // Without this the map keeps the origin's zoom and the rest of the route falls off screen.
    map.value.fitBounds(routeLine.value.getBounds(), { padding: [28, 28] });
};

const pinIcon = (kind: "origin" | "destination") =>
    L.divIcon({
        className: "vamo-map-pin",
        html: `<span class="vamo-map-pin--${kind}"></span>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
    });

const resolveLocality = async (kind: "origin" | "destination", point: L.LatLng) => {
    resolveControllers[kind]?.abort();
    const controller = new AbortController();
    resolveControllers[kind] = controller;
    const version = ++resolveVersions[kind];
    try {
        const locality = await locations.nearest(point.lat, point.lng);
        let address = "";
        try {
            const reverse = await locations.reverse(point.lat, point.lng, controller.signal);
            address =
                reverse.address || [reverse.street, reverse.house_number].filter(Boolean).join(" ");
        } catch {
            /* local resolve remains usable when Nominatim is unavailable */
        }
        if (version !== resolveVersions[kind]) return;
        const selection = {
            id: locality.id,
            name: locality.name,
            address,
            lat: point.lat,
            lon: point.lng,
        };
        if (kind === "origin") {
            originName.value = selection.name;
            emit("origin", selection);
        } else {
            destinationName.value = selection.name;
            emit("destination", selection);
        }
    } catch {
        quasar.notify({
            type: "warning",
            message: "No pudimos resolver esa localidad. Probá mover el pin.",
        });
    }
};

const scheduleResolve = (kind: "origin" | "destination", point: L.LatLng) => {
    if (resolveTimers[kind]) clearTimeout(resolveTimers[kind]);
    resolveTimers[kind] = setTimeout(() => {
        void resolveLocality(kind, point);
    }, 600);
};

const setMarker = async (
    kind: "origin" | "destination",
    point: L.LatLngExpression,
    resolve = true,
) => {
    if (!map.value) return;
    const marker = L.marker(point, {
        draggable: true,
        icon: pinIcon(kind),
    });
    if (!props.readonly) marker.on("dragend", () => scheduleResolve(kind, marker.getLatLng()));
    marker.addTo(map.value);
    if (kind === "origin") {
        originMarker.value?.remove();
        originMarker.value = marker;
    } else if (kind === "destination") {
        destinationMarker.value?.remove();
        destinationMarker.value = marker;
    }
    if (resolve) await resolveLocality(kind, marker.getLatLng());
};

const handleMapClick = (event: L.LeafletMouseEvent) => {
    if (props.readonly) return;
    const kind = props.activeKind ?? (originMarker.value ? "destination" : "origin");
    void setMarker(kind, event.latlng);
};

const locateUser = () => {
    if (props.readonly || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const point: L.LatLngExpression = [position.coords.latitude, position.coords.longitude];
            map.value?.setView(point, 11);
            void setMarker("origin", point);
        },
        () =>
            quasar.notify({
                type: "info",
                message: "Podés marcar origen y destino tocando el mapa.",
            }),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
};

defineExpose({ locateUser });

onMounted(() => {
    if (!mapElement.value) return;
    const initial = props.initialOrigin || props.initialDestination;
    map.value = L.map(mapElement.value).setView(
        initial ? [initial.lat, initial.lon] : defaultCenter,
        initial ? 12 : 5,
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
    }).addTo(map.value);
    map.value.on("click", handleMapClick);
    if (props.initialOrigin)
        void setMarker("origin", [props.initialOrigin.lat, props.initialOrigin.lon], false);
    if (props.initialDestination)
        void setMarker(
            "destination",
            [props.initialDestination.lat, props.initialDestination.lon],
            false,
        );
    drawRoute();
    if (!initial) locateUser();
});

watch(() => props.routeCoordinates, drawRoute, { deep: true });

onBeforeUnmount(() => {
    map.value?.remove();
    routeLine.value = null;
    map.value = null;
});
</script>

<template>
    <div class="locality-map-picker">
        <div ref="mapElement" class="locality-map-picker__map" :style="{ height: mapHeight }" />
        <div v-if="showLocations" class="locality-map-picker__locations q-mt-md q-gutter-y-sm">
            <div class="locality-map-picker__location">
                <span class="locality-map-picker__dot locality-map-picker__dot--origin" />
                {{ originLabel }}: <strong>{{ originName || "Marcá un punto en el mapa" }}</strong>
            </div>
            <div class="locality-map-picker__location">
                <span class="locality-map-picker__dot locality-map-picker__dot--destination" />
                {{ destinationLabel }}:
                <strong>{{ destinationName || "Marcá otro punto en el mapa" }}</strong>
            </div>
        </div>
    </div>
</template>

<style scoped>
.locality-map-picker__map {
    height: 320px;
    border-radius: 14px;
    overflow: hidden;
    z-index: 0;
}
.locality-map-picker__location {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}
.locality-map-picker__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
}
.locality-map-picker__dot--origin {
    background: var(--vamo-blue);
}
.locality-map-picker__dot--destination {
    background: var(--vamo-green);
}
:global(.vamo-map-pin) {
    background: transparent;
    border: 0;
}
:global(.vamo-map-pin span) {
    width: 22px;
    height: 22px;
    display: block;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid #fff;
    box-shadow: 0 2px 6px rgb(15 27 45 / 30%);
}
:global(.vamo-map-pin--origin) {
    background: var(--vamo-blue);
}
:global(.vamo-map-pin--destination) {
    background: var(--vamo-green);
}
</style>
