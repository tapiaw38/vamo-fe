<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { QBtn, QBtnToggle, QCard, QDate, QDialog, QIcon, QInput, QPage } from "quasar";
import RouteAutocompleteBox from "../components/RouteAutocompleteBox.vue";
import { useTrips } from "../composables/useTrips";
import type { RouteLocation } from "../types/routeLocation";
import { vehicleTypeOptions } from "../utils/labels";

const trips = useTrips();
const hasSearched = ref(false);
const dateDialog = ref(false);
const emptyLocation = (): RouteLocation => ({ id: "", name: "", address: "" });
const form = reactive({
    origin: emptyLocation(),
    destination: emptyLocation(),
    date: "",
    passengers: 1,
    vehicle_type: "",
});

const canSearch = computed(() => Boolean(form.origin.id && form.destination.id));
const dateLabel = computed(() => {
    if (!form.date) return "Cualquier fecha";

    return new Date(`${form.date}T12:00:00`).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
    });
});

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
                <QBtn
                    no-caps
                    outline
                    color="primary"
                    icon="calendar_month"
                    :label="dateLabel"
                    class="trip-search__date"
                    @click="dateDialog = true"
                />
                <div class="trip-search__stepper">
                    <QBtn
                        flat
                        round
                        dense
                        icon="remove"
                        color="primary"
                        aria-label="Quitar un pasajero"
                        :disable="form.passengers <= 1"
                        @click="form.passengers = Math.max(1, form.passengers - 1)"
                    />
                    <span class="trip-search__stepper-value">
                        {{ form.passengers }}
                        {{ form.passengers === 1 ? "pasajero" : "pasajeros" }}
                    </span>
                    <QBtn
                        flat
                        round
                        dense
                        icon="add"
                        color="primary"
                        aria-label="Agregar un pasajero"
                        :disable="form.passengers >= 8"
                        @click="form.passengers = Math.min(8, form.passengers + 1)"
                    />
                </div>
            </div>

            <QDialog v-model="dateDialog">
                <QCard class="q-pa-md trip-search__date-dialog">
                    <div class="text-h6">Fecha de salida</div>
                    <div class="form-helper q-mt-xs">
                        Elegí una fecha o buscá todas las salidas.
                    </div>
                    <!-- minimal drops QDate's header, which renders as an empty coloured block
                         with placeholder dashes while no date is picked. -->
                    <QDate
                        v-model="form.date"
                        mask="YYYY-MM-DD"
                        color="primary"
                        minimal
                        class="q-mt-sm"
                    />
                    <div class="row justify-end q-gutter-sm q-mt-md">
                        <QBtn
                            no-caps
                            flat
                            color="primary"
                            label="Limpiar fecha"
                            @click="
                                form.date = '';
                                dateDialog = false;
                            "
                        />
                        <QBtn
                            no-caps
                            unelevated
                            color="primary"
                            label="Aplicar fecha"
                            @click="dateDialog = false"
                        />
                    </div>
                </QCard>
            </QDialog>

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
.trip-search__date {
    align-self: stretch;
    border-radius: 999px;
    flex: 1 1 0;
    min-height: 48px;
}
.trip-search__stepper {
    align-items: center;
    background: #fff;
    border: 1px solid var(--vamo-border);
    border-radius: 999px;
    display: flex;
    flex: 1 1 0;
    gap: 2px;
    justify-content: space-between;
    min-height: 48px;
    padding: 0 6px;
}
.trip-search__stepper-value {
    font-size: 0.88rem;
    font-weight: 600;
    text-align: center;
    white-space: nowrap;
}
.trip-search__filters :deep(.q-field) {
    flex: 1 1 0;
}
.trip-search__date-dialog {
    border-radius: 20px;
    max-width: min(94vw, 380px);
    width: 100%;
}
.trip-search__date-dialog :deep(.q-date) {
    margin-inline: auto;
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
