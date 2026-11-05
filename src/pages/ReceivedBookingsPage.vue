<script setup lang="ts">
import { onMounted, ref } from "vue";
import { QBtn, QCard, QPage, QSelect, useQuasar } from "quasar";
import { useBookings } from "../composables/useBookings";
import { labelFor } from "../utils/labels";

const bookings = useBookings(); const quasar = useQuasar(); const status = ref("pending");
onMounted(() => bookings.loadReceived(status.value)); const filter = () => bookings.loadReceived(status.value);
const action = async (id: string, kind: "confirm" | "reject") => { try { if (kind === "confirm") await bookings.confirm(id); else await bookings.reject(id); quasar.notify({ type: "positive", message: kind === "confirm" ? "Reserva confirmada" : "Reserva rechazada" }); } catch { quasar.notify({ type: "negative", message: "No se pudo actualizar la reserva" }); } };
const statusClass = (value: string) => value === "confirmed" || value === "completed" ? "positive" : value === "pending" ? "warning" : value === "cancelled" || value === "rejected" ? "negative" : "neutral";
const statuses = ["pending", "confirmed", "rejected", "cancelled", "expired", "completed"].map((value) => ({ label: labelFor(value), value }));
</script>

<template>
    <QPage class="q-pa-md page-background"><div class="page-shell">
        <QBtn no-caps flat icon="arrow_back" label="Mis viajes" to="/trips/mine" class="q-mb-sm" />
        <div class="section-kicker">Conducción</div><div class="text-h5 q-mb-md">Reservas recibidas</div>
        <QSelect v-model="status" label="Filtrar por estado" :options="statuses" emit-value map-options @update:model-value="filter" />
        <QCard v-for="booking in bookings.received.value" :key="booking.id" class="trip-card q-mt-md">
            <div class="trip-card__top"><div class="text-h6">{{ booking.trip?.origin_name }} → {{ booking.trip?.destination_name }}</div><span class="status-badge" :class="`status-badge--${statusClass(booking.status)}`">{{ labelFor(booking.status) }}</span></div>
            <div class="trip-card__ticket"><div class="trip-card__meta">Pasajero: {{ booking.passenger_id }}</div><div class="price q-mt-sm">{{ booking.seats }}<span class="price-unit">asiento(s)</span></div><QBtn v-if="booking.status === 'pending'" no-caps color="positive" label="Confirmar reserva" class="q-mt-md q-mr-sm" @click="action(booking.id, 'confirm')" /><QBtn v-if="booking.status === 'pending'" no-caps flat color="negative" label="Rechazar reserva" class="q-mt-md" @click="action(booking.id, 'reject')" /></div>
        </QCard>
        <QCard v-if="!bookings.received.value.length" class="trip-card q-pa-lg q-mt-md text-center"><div class="text-h6">No hay reservas pendientes</div><div class="trip-card__meta q-mt-sm">Las nuevas solicitudes de tus viajes van a aparecer acá.</div><QBtn no-caps outline color="primary" label="Ver mis viajes" to="/trips/mine" class="q-mt-md" /></QCard>
    </div></QPage>
</template>
