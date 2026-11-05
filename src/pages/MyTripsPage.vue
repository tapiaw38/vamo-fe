<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { QBtn, QCard, QPage, QSelect, QTab, QTabs } from "quasar";
import { useBookings } from "../composables/useBookings";
import { useDrivers } from "../composables/useDrivers";
import { useRideRequests } from "../composables/useRideRequests";
import { useTrips } from "../composables/useTrips";
import { labelFor } from "../utils/labels";

const bookings = useBookings();
const drivers = useDrivers();
const requests = useRideRequests();
const trips = useTrips();
const tab = ref("passenger");
const status = ref("");
const hasDriverProfile = computed(() => Boolean(drivers.profile.value));
const activeRequest = requests.current;
const statuses = [
    { label: "Todos", value: "" },
    "draft",
    "published",
    "full",
    "departed",
    "completed",
    "cancelled",
].map((value) => (typeof value === "string" ? { label: labelFor(value), value } : value));
const statusClass = (value: string) =>
    value === "published" || value === "full" || value === "completed" || value === "confirmed"
        ? "positive"
        : value === "pending" || value === "draft"
          ? "warning"
          : value === "cancelled" || value === "rejected" || value === "expired"
            ? "negative"
            : "neutral";
const changeStatus = () => trips.mine(status.value);
onMounted(async () => {
    await Promise.all([
        bookings.mine(),
        requests.active().catch(() => null),
        drivers.load().catch(() => null),
    ]);
    if (drivers.profile.value) await trips.mine();
});
</script>

<template>
    <QPage class="q-pa-md page-background">
        <div class="page-shell my-trips-page">
            <div class="my-trips-page__head">
                <QBtn flat round dense icon="arrow_back" to="/" aria-label="Volver al inicio" />
                <div>
                    <div class="section-kicker">Actividad</div>
                    <div class="text-h6">Mis viajes</div>
                </div>
            </div>
            <QTabs
                v-model="tab"
                dense
                align="justify"
                active-color="primary"
                indicator-color="transparent"
                class="my-trips-page__tabs"
            >
                <QTab name="passenger" label="Como pasajero" />
                <QTab v-if="hasDriverProfile" name="driver" label="Como conductor" />
            </QTabs>

            <template v-if="tab === 'passenger'">
                <QCard v-if="activeRequest" class="trip-card q-mt-md">
                    <div class="trip-card__top">
                        <div class="text-subtitle1">Pedido de viaje</div>
                        <span
                            class="status-badge"
                            :class="`status-badge--${statusClass(activeRequest.status)}`"
                            >{{ labelFor(activeRequest.status) }}</span
                        >
                    </div>
                    <div class="trip-card__ticket">
                        <div class="route-stop__label">
                            {{ activeRequest.origin_name }} → {{ activeRequest.destination_name }}
                        </div>
                        <div class="trip-card__meta q-mt-sm">
                            {{
                                activeRequest.requested_at
                                    ? new Date(activeRequest.requested_at).toLocaleString("es-AR")
                                    : "Salida pendiente"
                            }}
                        </div>
                        <QBtn
                            no-caps
                            flat
                            color="primary"
                            label="Ver pedido"
                            class="q-mt-sm"
                            :to="`/ride-requests/${activeRequest.id}/waiting`"
                        />
                    </div>
                </QCard>
                <QCard
                    v-for="booking in bookings.items.value"
                    :key="booking.id"
                    class="trip-card q-mt-md"
                >
                    <div class="trip-card__top">
                        <div class="price">
                            $ {{ booking.total_price }} <span class="price-unit">total</span>
                        </div>
                        <span
                            class="status-badge"
                            :class="`status-badge--${statusClass(booking.status)}`"
                            >{{ labelFor(booking.status) }}</span
                        >
                    </div>
                    <div class="trip-card__ticket">
                        <div class="route-stop__label">
                            {{ booking.trip?.origin_name }} → {{ booking.trip?.destination_name }}
                        </div>
                        <div class="trip-card__meta q-mt-sm">
                            {{
                                booking.trip
                                    ? new Date(booking.trip.departure_at).toLocaleString("es-AR")
                                    : "Viaje sin detalle"
                            }}
                        </div>
                    </div>
                </QCard>
                <QCard
                    v-if="!activeRequest && !bookings.items.value.length"
                    class="trip-card empty-state q-pa-lg q-mt-md text-center"
                    ><div class="text-h6">Todavía no tenés viajes</div>
                    <div class="form-helper q-mt-sm">
                        Buscá una salida o pedí un viaje para empezar.
                    </div>
                    <QBtn
                        no-caps
                        color="primary"
                        label="Buscar viajes"
                        to="/trips/search"
                        class="q-mt-md"
                /></QCard>
            </template>

            <template v-else>
                <div class="row items-center justify-between q-mt-md q-gutter-sm">
                    <QSelect
                        v-model="status"
                        class="col"
                        label="Filtrar por estado"
                        :options="statuses"
                        emit-value
                        map-options
                        outlined
                        dense
                        @update:model-value="changeStatus"
                    /><QBtn
                        no-caps
                        unelevated
                        color="primary"
                        label="Publicar viaje"
                        to="/trips/publish"
                    />
                </div>
                <QCard v-for="trip in trips.items.value" :key="trip.id" class="trip-card q-mt-md"
                    ><div class="trip-card__top">
                        <span class="price">$ {{ trip.price_per_seat }}</span
                        ><span class="price-unit">/asiento</span>
                    </div>
                    <div class="trip-card__ticket">
                        <div class="route-stop__label">
                            {{ trip.origin_name }} → {{ trip.destination_name }}
                        </div>
                        <div class="trip-card__meta q-mt-sm">
                            {{ new Date(trip.departure_at).toLocaleString("es-AR") }} ·
                            {{ trip.available_seats }}/{{ trip.total_seats }} asientos
                        </div>
                        <span
                            class="status-badge q-mt-sm"
                            :class="`status-badge--${statusClass(trip.status)}`"
                            >{{ labelFor(trip.status) }}</span
                        >
                    </div></QCard
                >
                <QCard
                    v-if="!trips.items.value.length"
                    class="trip-card empty-state q-pa-lg q-mt-md text-center"
                    ><div class="text-h6">Todavía no publicaste viajes</div>
                    <div class="form-helper q-mt-sm">
                        Publicá una salida para empezar a recibir reservas.
                    </div>
                    <QBtn
                        no-caps
                        color="primary"
                        label="Publicar viaje"
                        to="/trips/publish"
                        class="q-mt-md"
                /></QCard>
            </template>
            <QCard v-if="!hasDriverProfile" class="trip-card q-pa-md q-mt-md"
                ><div class="text-subtitle1">¿Querés publicar viajes?</div>
                <div class="form-helper q-mt-xs">
                    Completá tu perfil de conductor para publicar salidas.
                </div>
                <QBtn
                    no-caps
                    flat
                    color="primary"
                    label="Completar perfil de conductor"
                    to="/driver-profile"
                    class="q-mt-sm"
            /></QCard>
        </div>
    </QPage>
</template>

<style scoped>
.my-trips-page__head {
    align-items: center;
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
}
.my-trips-page__tabs {
    background: #fff;
    border: 1px solid var(--vamo-border);
    border-radius: 14px;
    padding: 4px;
}
.my-trips-page__tabs :deep(.q-tab--active) {
    background: var(--vamo-terra-soft);
    border-radius: 10px;
}
</style>
