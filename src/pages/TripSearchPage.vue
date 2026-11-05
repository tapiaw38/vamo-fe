<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { QBtn, QBtnToggle, QCard, QIcon, QInput, QPage } from "quasar";
import RouteAutocompleteBox from "../components/RouteAutocompleteBox.vue";
import { useTrips } from "../composables/useTrips";
import type { RouteLocation } from "../types/routeLocation";
import { vehicleTypeOptions } from "../utils/labels";

const trips = useTrips();
const hasSearched = ref(false);
const emptyLocation = (): RouteLocation => ({ id: "", name: "", address: "" });
const form = reactive({
    origin: emptyLocation(),
    destination: emptyLocation(),
    date: "",
    passengers: 1,
    vehicle_type: "",
});

const canSearch = computed(() => Boolean(form.origin.id && form.destination.id));

const swapRoute = () => {
    if (!canSearch.value) return;
    const origin = { ...form.origin };
    form.origin = { ...form.destination };
    form.destination = origin;
};

const search = async () => {
    if (!canSearch.value) return;
    hasSearched.value = true;
    await trips.search({
        origin_locality_id: form.origin.id,
        destination_locality_id: form.destination.id,
        date: form.date,
        passengers: form.passengers,
        vehicle_type: form.vehicle_type || undefined,
    });
};
</script>

<template>
    <QPage class="q-pa-md page-background">
        <div class="page-shell trip-search">
            <div class="trip-search__head">
                <QBtn flat round dense icon="arrow_back" to="/" aria-label="Volver al inicio" />
                <div class="text-h6">Buscar viajes</div>
            </div>

            <RouteAutocompleteBox
                v-model:origin="form.origin"
                v-model:destination="form.destination"
            />

            <div class="trip-search__swap-row">
                <QBtn
                    no-caps
                    flat
                    dense
                    icon="swap_vert"
                    color="primary"
                    label="Invertir"
                    :disable="!canSearch"
                    @click="swapRoute"
                />
            </div>

            <div class="trip-search__filters">
                <QInput v-model="form.date" label="Fecha" type="date" outlined dense class="col" />
                <QInput
                    v-model.number="form.passengers"
                    label="Pasajeros"
                    type="number"
                    min="1"
                    outlined
                    dense
                    class="col"
                />
            </div>

            <div class="trip-search__label">Tipo de vehículo</div>
            <QBtnToggle
                v-model="form.vehicle_type"
                class="trip-search__toggle"
                spread
                no-caps
                unelevated
                toggle-color="primary"
                color="white"
                text-color="ink"
                :options="[{ label: 'Todos', value: '' }, ...vehicleTypeOptions.slice(0, 2)]"
            />

            <QBtn
                no-caps
                unelevated
                color="primary"
                class="trip-search__submit full-width"
                label="Buscar viajes"
                :loading="trips.loading.value"
                :disable="!canSearch"
                @click="search"
            />
            <div v-if="!canSearch" class="form-helper text-center q-mt-sm">
                Elegí origen y destino para ver viajes disponibles.
            </div>

            <div v-if="trips.items.value.length" class="trip-search__results">
                <div class="trip-search__label">
                    {{ trips.items.value.length }}
                    {{ trips.items.value.length === 1 ? "viaje encontrado" : "viajes encontrados" }}
                </div>
                <QCard
                    v-for="trip in trips.items.value"
                    :key="trip.id"
                    class="trip-card q-mb-sm"
                    clickable
                    @click="$router.push(`/trips/${trip.id}`)"
                >
                    <div class="trip-card__top">
                        <span class="price">$ {{ trip.price_per_seat }}</span>
                        <span class="price-unit">/asiento</span>
                    </div>
                    <div class="trip-card__ticket">
                        <div class="route-line">
                            <div class="route-stop">
                                <span class="route-stop__dot" />
                                <span class="route-stop__label">{{ trip.origin_name }}</span>
                            </div>
                            <div class="route-connector" />
                            <div class="route-stop">
                                <span class="route-stop__dot route-stop__dot--destination" />
                                <span class="route-stop__label">{{ trip.destination_name }}</span>
                            </div>
                        </div>
                        <div class="trip-card__meta q-mt-md">
                            {{ new Date(trip.departure_at).toLocaleString("es-AR") }} ·
                            {{ trip.available_seats }} asientos disponibles
                        </div>
                        <div class="trip-card__meta q-mt-xs">
                            {{ trip.driver_name }} · {{ trip.vehicle_make }}
                            {{ trip.vehicle_model }}
                        </div>
                        <div class="trip-card__meta q-mt-xs">
                            <span v-if="trip.total_ratings && trip.average_score !== undefined">
                                <QIcon name="star" size="14px" color="amber-8" />
                                {{ trip.average_score.toFixed(1) }} ·
                                {{ trip.total_ratings }} viajes
                            </span>
                            <span v-else>Sin calificaciones todavía</span>
                        </div>
                        <img
                            v-if="trip.vehicle_photo_url"
                            :src="trip.vehicle_photo_url"
                            alt="Vehículo"
                            class="trip-card__vehicle-photo"
                        />
                    </div>
                </QCard>
            </div>

            <QCard v-if="!hasSearched" class="trip-card empty-state q-pa-lg text-center q-mt-md">
                <QIcon name="explore" size="36px" color="grey-6" />
                <div class="text-h6 q-mt-sm">Planificá tu próximo viaje</div>
                <div class="trip-card__meta q-mt-xs">
                    Elegí desde dónde salís y a dónde vas para ver las salidas disponibles.
                </div>
            </QCard>
            <QCard
                v-else-if="!trips.loading.value && !trips.items.value.length"
                class="trip-card empty-state q-pa-lg text-center q-mt-md"
            >
                <QIcon name="search_off" size="36px" color="grey-6" />
                <div class="text-h6 q-mt-sm">No encontramos viajes</div>
                <div class="trip-card__meta q-mt-xs">Probá con otra fecha o localidad.</div>
            </QCard>
        </div>
    </QPage>
</template>

<style scoped>
.trip-search {
    padding-bottom: 32px;
}
.trip-search__head {
    align-items: center;
    display: flex;
    gap: 6px;
    margin-bottom: 14px;
}
.trip-search__swap-row {
    display: flex;
    justify-content: flex-end;
    margin: 6px 0 10px;
}
.trip-search__filters {
    display: flex;
    gap: 10px;
}
.trip-search__label {
    color: var(--vamo-muted);
    font-size: 0.82rem;
    font-weight: 600;
    margin: 16px 0 8px;
}
.trip-search__toggle {
    background: #fff;
    border: 1px solid var(--vamo-border);
    border-radius: 14px;
    overflow: hidden;
}
.trip-search__submit {
    margin-top: 18px;
    min-height: 52px;
}
.trip-search__results {
    margin-top: 24px;
}
</style>
