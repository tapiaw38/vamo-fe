<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { QBtn, QCard, QDialog, QIcon, useQuasar } from "quasar";
import LocalityMapPicker from "./LocalityMapPicker.vue";
import { useLocations } from "../composables/useLocations";
import { useRouteAutocomplete } from "../composables/useRouteAutocomplete";
import type { RouteField, RouteLocation, RouteSuggestion } from "../types/routeLocation";

const props = withDefaults(
    defineProps<{ origin: RouteLocation; destination: RouteLocation; autoLocate?: boolean }>(),
    { autoLocate: false },
);
const emit = defineEmits<{
    "update:origin": [value: RouteLocation];
    "update:destination": [value: RouteLocation];
}>();

const quasar = useQuasar();
const locations = useLocations();
const activeField = ref<RouteField>("origin");
const mapDialog = ref(false);
const provinceName = (provinceID: string) =>
    locations.provinces.value.find((item) => item.id === provinceID)?.name || "Localidad";
const autocomplete = useRouteAutocomplete(provinceName);
const activeValue = computed(() =>
    activeField.value === "origin" ? props.origin.address : props.destination.address,
);
const updateField = (field: RouteField, value: RouteLocation) => {
    if (field === "origin") emit("update:origin", value);
    else emit("update:destination", value);
};
const clearField = (field: RouteField) => {
    activeField.value = field;
    autocomplete.clear();
    updateField(field, { id: "", name: "", address: "" });
};
const inputField = (field: RouteField, event: Event) => {
    activeField.value = field;
    const address = (event.target as HTMLInputElement).value;
    const previous = field === "origin" ? props.origin : props.destination;
    updateField(field, { ...previous, id: "", address });
    autocomplete.search(address, field);
};
const chooseSuggestion = async (item: RouteSuggestion) => {
    let localityID = item.id;
    let localityName = item.address || item.name;
    if (!localityID) {
        try {
            const locality = await locations.nearest(item.lat, item.lon);
            localityID = locality.id;
            localityName = locality.name;
        } catch {
            quasar.notify({ type: "warning", message: "No pudimos resolver esa localidad." });
            return;
        }
    }
    updateField(activeField.value, {
        id: localityID,
        name: localityName,
        address: item.name,
        lat: item.lat,
        lon: item.lon,
    });
    autocomplete.clear();
};
const setMapSelection = (field: RouteField, value: RouteLocation) => {
    updateField(field, value);
    if (activeField.value === field) mapDialog.value = false;
};
const resolveCurrentLocation = () => {
    if (!navigator.geolocation) {
        quasar.notify({ type: "info", message: "Podés escribir una dirección o usar el mapa." });
        return;
    }
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const point = { lat: position.coords.latitude, lon: position.coords.longitude };
            autocomplete.currentPosition.value = point;
            try {
                const [locality, reverse] = await Promise.all([
                    locations.nearest(point.lat, point.lon),
                    locations.reverse(point.lat, point.lon),
                ]);
                updateField("origin", {
                    id: locality.id,
                    name: locality.name,
                    address:
                        reverse.address ||
                        [reverse.street, reverse.house_number].filter(Boolean).join(" "),
                    ...point,
                });
            } catch {
                quasar.notify({
                    type: "info",
                    message: "Podés escribir una dirección o usar el mapa.",
                });
            }
        },
        () =>
            quasar.notify({
                type: "info",
                message: "Podés escribir una dirección o usar el mapa.",
            }),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
};
const openMap = (field: RouteField) => {
    activeField.value = field;
    autocomplete.clear();
    mapDialog.value = true;
};

onMounted(() => {
    if (!locations.provinces.value.length) void locations.loadProvinces();
    if (props.autoLocate) resolveCurrentLocation();
});
</script>

<template>
    <div class="route-autocomplete">
        <div class="route-box" role="group" aria-label="Ruta">
            <div
                class="route-box__row"
                :class="{ 'route-box__row--active': activeField === 'origin' }"
            >
                <span class="route-box__dot" />
                <input
                    :value="origin.address"
                    class="route-box__input"
                    placeholder="¿Desde dónde salís?"
                    aria-label="Origen"
                    @focus="activeField = 'origin'"
                    @input="inputField('origin', $event)"
                />
                <QBtn
                    v-if="origin.address"
                    flat
                    round
                    dense
                    size="sm"
                    icon="cancel"
                    color="grey-6"
                    aria-label="Borrar origen"
                    @click="clearField('origin')"
                />
            </div>
            <div class="route-box__divider" />
            <div
                class="route-box__row"
                :class="{ 'route-box__row--active': activeField === 'destination' }"
            >
                <span class="route-box__dot route-box__dot--destination" />
                <input
                    :value="destination.address"
                    class="route-box__input"
                    placeholder="¿A dónde vas?"
                    aria-label="Destino"
                    @focus="activeField = 'destination'"
                    @input="inputField('destination', $event)"
                />
                <QBtn
                    v-if="destination.address"
                    flat
                    round
                    dense
                    size="sm"
                    icon="cancel"
                    color="grey-6"
                    aria-label="Borrar destino"
                    @click="clearField('destination')"
                />
            </div>
        </div>
        <div class="suggest">
            <div v-if="autocomplete.searching.value" class="suggest__hint">
                Buscando direcciones…
            </div>
            <button
                v-for="item in autocomplete.suggestions.value"
                :key="`${item.name}-${item.lat}-${item.lon}`"
                type="button"
                class="suggest__row"
                @click="chooseSuggestion(item)"
            >
                <span class="suggest__lead"
                    ><QIcon name="place" size="20px" color="grey-7" /><small
                        v-if="autocomplete.distance(item)"
                        >{{ autocomplete.distance(item) }}</small
                    ></span
                >
                <span class="suggest__text"
                    ><strong>{{ item.name }}</strong
                    ><small>{{ item.address }}</small></span
                >
            </button>
            <button
                v-if="activeField === 'origin'"
                type="button"
                class="suggest__row"
                @click="resolveCurrentLocation"
            >
                <span class="suggest__badge"><QIcon name="my_location" size="20px" /></span
                ><span class="suggest__text"><strong>Usar mi ubicación</strong></span>
            </button>
            <button type="button" class="suggest__row" @click="openMap(activeField)">
                <span class="suggest__badge"><QIcon name="pin_drop" size="20px" /></span
                ><span class="suggest__text"><strong>Establecer ubicación en el mapa</strong></span>
            </button>
        </div>
        <QDialog v-model="mapDialog">
            <QCard class="q-pa-md route-autocomplete__map-dialog">
                <div class="text-subtitle1 q-mb-sm">
                    {{ activeField === "origin" ? "Fijá tu origen" : "Fijá tu destino" }}
                </div>
                <div class="form-helper q-mb-sm">Tocá el mapa o arrastrá el marcador.</div>
                <LocalityMapPicker
                    :active-kind="activeField"
                    :show-locations="false"
                    map-height="52vh"
                    :initial-origin="
                        origin.lat !== undefined && origin.lon !== undefined
                            ? { lat: origin.lat, lon: origin.lon }
                            : undefined
                    "
                    :initial-destination="
                        destination.lat !== undefined && destination.lon !== undefined
                            ? { lat: destination.lat, lon: destination.lon }
                            : undefined
                    "
                    @origin="setMapSelection('origin', $event)"
                    @destination="setMapSelection('destination', $event)"
                />
                <QBtn
                    no-caps
                    flat
                    label="Cerrar mapa"
                    class="full-width q-mt-sm"
                    @click="mapDialog = false"
                />
            </QCard>
        </QDialog>
    </div>
</template>

<style scoped>
.route-box {
    background: #fff;
    border: 1px solid var(--vamo-border-strong);
    border-radius: 18px;
    padding: 4px 14px;
}
.route-box__row {
    align-items: center;
    display: flex;
    gap: 12px;
    min-height: 52px;
}
.route-box__row--active .route-box__input {
    font-weight: 600;
}
.route-box__dot {
    background: var(--vamo-ink);
    border-radius: 50%;
    flex-shrink: 0;
    height: 10px;
    width: 10px;
}
.route-box__dot--destination {
    background: transparent;
    border: 3px solid var(--vamo-ink);
    border-radius: 3px;
    height: 11px;
    width: 11px;
}
.route-box__divider {
    background: var(--vamo-border);
    height: 1px;
    margin-left: 22px;
}
.route-box__input {
    background: transparent;
    border: 0;
    color: var(--vamo-ink);
    flex: 1;
    font-family: inherit;
    font-size: 1rem;
    min-width: 0;
    outline: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.route-box__input::placeholder {
    color: var(--vamo-placeholder);
}
.suggest {
    margin-top: 6px;
}
.suggest__hint {
    color: var(--vamo-muted);
    font-size: 0.82rem;
    padding: 12px 4px;
}
.suggest__row {
    align-items: center;
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--vamo-border);
    color: var(--vamo-ink);
    cursor: pointer;
    display: flex;
    gap: 14px;
    padding: 13px 4px;
    text-align: left;
    width: 100%;
}
.suggest__row:last-child {
    border-bottom: 0;
}
.suggest__lead {
    align-items: center;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 2px;
    width: 46px;
}
.suggest__lead small {
    color: var(--vamo-muted);
    font-size: 0.72rem;
}
.suggest__badge {
    align-items: center;
    background: var(--vamo-terra-soft);
    border-radius: 50%;
    color: var(--vamo-blue);
    display: flex;
    flex-shrink: 0;
    height: 40px;
    justify-content: center;
    margin-left: 3px;
    width: 40px;
}
.suggest__text {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
}
.suggest__text strong,
.suggest__text small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.suggest__text strong {
    font-size: 0.97rem;
}
.suggest__text small {
    color: var(--vamo-muted);
    font-size: 0.82rem;
}
.route-autocomplete__map-dialog {
    width: min(94vw, 520px);
}
</style>
