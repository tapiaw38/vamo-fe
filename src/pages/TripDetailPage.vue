<script setup lang="ts">
import { onMounted, ref } from "vue";
import { QBtn, QCard, QInput, QPage, useQuasar } from "quasar";
import { useRoute } from "vue-router";
import { useTrips } from "../composables/useTrips";
import { labelFor } from "../utils/labels";
import { useBookings } from "../composables/useBookings";
const route = useRoute();
const trips = useTrips();
const bookings = useBookings();
const quasar = useQuasar();
const seats = ref(1);
onMounted(() => trips.load(String(route.params.id)));
const statusClass = (value: string) => value === "published" || value === "full" || value === "completed" ? "positive" : value === "cancelled" ? "negative" : value === "draft" ? "warning" : "neutral";
const reserve = async () => {
    try {
        await bookings.create(String(route.params.id), seats.value);
        quasar.notify({ type: "positive", message: "Reserva creada" });
    } catch {
        quasar.notify({ type: "negative", message: "No se pudo reservar" });
    }
};
</script>
<template>
    <QPage class="q-pa-md page-background"><div class="page-shell">
        <QBtn no-caps flat icon="arrow_back" label="Volver a buscar" to="/trips/search" class="q-mb-sm" />
        <QCard v-if="trips.current.value" class="trip-card trip-card--active">
            <div class="trip-card__top">
                <span class="price">$ {{ trips.current.value.price_per_seat }}</span
                ><span class="price-unit">/asiento</span>
                <span class="status-badge q-ml-md" :class="`status-badge--${statusClass(trips.current.value.status)}`">{{ labelFor(trips.current.value.status) }}</span>
            </div>
            <div class="trip-card__ticket">
                <div class="route-line">
                    <div class="route-stop">
                        <span class="route-stop__dot" /><span class="route-stop__label">{{
                            trips.current.value.origin_name
                        }}</span>
                    </div>
                    <div class="route-connector" />
                    <div class="route-stop">
                        <span class="route-stop__dot route-stop__dot--destination" /><span
                            class="route-stop__label"
                            >{{ trips.current.value.destination_name }}</span
                        >
                    </div>
                </div>
                <div class="trip-card__meta q-mt-md">
                    {{ new Date(trips.current.value.departure_at).toLocaleString("es-AR") }} ·
                    {{ trips.current.value.available_seats }} asientos disponibles
                </div>
                <div class="trip-card__meta q-mt-xs">
                    {{ trips.current.value.driver_name }} · {{ trips.current.value.vehicle_make }}
                    {{ trips.current.value.vehicle_model }}
                </div>
                <div class="trip-card__meta q-mt-xs">
                    <span v-if="trips.current.value.total_ratings && trips.current.value.average_score !== undefined">★ {{ trips.current.value.average_score.toFixed(1) }} · {{ trips.current.value.total_ratings }} viajes</span>
                    <span v-else>Sin calificaciones todavía</span>
                </div>
                <div v-if="trips.current.value.notes" class="trip-card__meta q-mt-xs">
                    {{ trips.current.value.notes }}
                </div>
            </div>
            <div class="row items-center q-gutter-sm q-mt-md">
                <QInput
                    v-model.number="seats"
                    type="number"
                    min="1"
                    :max="trips.current.value.available_seats"
                    label="Asientos"
                />
                <QBtn
                    no-caps
                    color="primary"
                    label="Reservar asiento"
                    :loading="bookings.loading.value"
                    @click="reserve"
                />
            </div>
        </QCard>
        <QCard v-else class="trip-card q-pa-lg text-center">
            <div class="text-h6">Viaje no encontrado</div>
            <div class="trip-card__meta q-mt-sm">Volvé a la búsqueda para elegir otro viaje.</div>
            <QBtn no-caps color="primary" label="Buscar viajes" to="/trips/search" class="q-mt-md" />
        </QCard>
    </div></QPage>
</template>
