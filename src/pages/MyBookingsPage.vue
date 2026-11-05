<script setup lang="ts">
import { onMounted, ref } from "vue";
import { QBtn, QCard, QDialog, QInput, QPage, QRating, QSelect, useQuasar } from "quasar";
import { useBookings } from "../composables/useBookings";
import type { Booking } from "../types/bookings";
import { labelFor } from "../utils/labels";

const bookings = useBookings(); const quasar = useQuasar(); const status = ref("");
const ratingBooking = ref<Booking | null>(null); const ratingScore = ref(0); const ratingComment = ref(""); const ratingDialog = ref(false);
const options = [{ label: "Todas", value: "" }, { label: "Pendientes", value: "pending" }, { label: "Confirmadas", value: "confirmed" }, { label: "Finalizadas", value: "completed" }, { label: "Canceladas", value: "cancelled" }, { label: "Rechazadas", value: "rejected" }, { label: "Expiradas", value: "expired" }];
onMounted(() => bookings.mine()); const filter = () => bookings.mine(status.value);
const cancel = async (id: string) => { try { await bookings.cancel(id); quasar.notify({ type: "positive", message: "Reserva cancelada" }); } catch { quasar.notify({ type: "negative", message: "No se pudo cancelar" }); } };
const statusClass = (value: string) => value === "confirmed" || value === "completed" ? "positive" : value === "pending" ? "warning" : value === "cancelled" || value === "rejected" ? "negative" : "neutral";
const openRating = (booking: Booking) => { ratingBooking.value = booking; ratingScore.value = 0; ratingComment.value = ""; ratingDialog.value = true; };
const submitRating = async () => {
    if (!ratingBooking.value || ratingScore.value < 1) return;
    try {
        await bookings.rate(ratingBooking.value.id, ratingScore.value, ratingComment.value);
        ratingBooking.value.rated = true; ratingBooking.value.can_rate = false; ratingDialog.value = false;
        quasar.notify({ type: "positive", message: "Calificación enviada" });
    } catch { quasar.notify({ type: "negative", message: "No se pudo enviar la calificación" }); }
};
</script>

<template>
    <QPage class="q-pa-md page-background"><div class="page-shell">
        <QBtn no-caps flat icon="arrow_back" label="Inicio" to="/" class="q-mb-sm" />
        <div class="section-kicker">Pasajero</div><div class="text-h5 q-mb-md">Mis reservas</div>
        <QSelect v-model="status" label="Filtrar por estado" :options="options" emit-value map-options @update:model-value="filter" />
        <QCard v-for="booking in bookings.items.value" :key="booking.id" class="trip-card q-mt-md">
            <div class="trip-card__top"><div class="price">$ {{ booking.total_price }}<span class="price-unit">total</span></div><span class="status-badge" :class="`status-badge--${statusClass(booking.status)}`">{{ labelFor(booking.status) }}</span></div>
            <div class="trip-card__ticket"><div class="route-stop__label">{{ booking.trip?.origin_name }} → {{ booking.trip?.destination_name }}</div><div class="trip-card__meta q-mt-sm">{{ booking.trip ? new Date(booking.trip.departure_at).toLocaleString("es-AR") : "Viaje sin detalle" }} · {{ booking.seats }} asiento(s)</div><div class="trip-card__meta q-mt-xs">Precio por asiento: $ {{ booking.unit_price_snapshot }}</div><QBtn v-if="booking.status === 'pending' || booking.status === 'confirmed'" no-caps flat color="negative" label="Cancelar reserva" class="q-mt-sm" @click="cancel(booking.id)" /><QBtn v-if="booking.can_rate" no-caps outline color="primary" label="Calificar viaje" class="q-mt-sm q-ml-sm" @click="openRating(booking)" /></div>
        </QCard>
        <QCard v-if="!bookings.items.value.length" class="trip-card q-pa-lg q-mt-md text-center"><div class="text-h6">Todavía no tenés reservas</div><div class="trip-card__meta q-mt-sm">Buscá una ruta y reservá tu próximo viaje.</div><QBtn no-caps color="primary" label="Buscar viajes" to="/trips/search" class="q-mt-md" /></QCard>
        <QDialog v-model="ratingDialog"><QCard class="q-pa-md" style="min-width: min(90vw, 360px)"><div class="text-h6">Calificar viaje</div><div class="text-body2 text-grey-7 q-mt-sm">¿Cómo fue tu experiencia?</div><QRating v-model="ratingScore" size="2.2em" color="warning" class="q-mt-md" /><QInput v-model="ratingComment" type="textarea" label="Comentario (opcional)" class="q-mt-md" /><div class="row justify-end q-gutter-sm q-mt-md"><QBtn no-caps flat label="Cancelar" @click="ratingDialog = false" /><QBtn no-caps color="primary" label="Enviar calificación" :disable="ratingScore < 1" @click="submitRating" /></div></QCard></QDialog>
    </div></QPage>
</template>
