<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { QBtn, QCard, QDialog, QPage, useQuasar } from "quasar";
import { useRoute, useRouter } from "vue-router";
import LocalityMapPicker from "../components/LocalityMapPicker.vue";
import { useRideRequests } from "../composables/useRideRequests";
import { useLocations } from "../composables/useLocations";

const route = useRoute();
const router = useRouter();
const requests = useRideRequests();
const locations = useLocations();
const quasar = useQuasar();
const request = ref<Awaited<ReturnType<typeof requests.active>>>(null);
const cancelDialog = ref(false);
const routeCoordinates = ref<Array<[number, number]>>([]);
let routeRequestKey = "";
let pollTimer: ReturnType<typeof setInterval> | undefined;

const elapsed = computed(() => {
    if (!request.value) return "";
    const minutes = Math.max(
        0,
        Math.floor(
            (Date.now() -
                new Date(request.value.created_at || request.value.requested_at).getTime()) /
                60000,
        ),
    );
    return minutes === 0
        ? "Hace menos de un minuto"
        : `Hace ${minutes} minuto${minutes === 1 ? "" : "s"}`;
});

const refresh = async () => {
    try {
        const current = await requests.active();
        if (current) {
            request.value = current;
            void loadRoute(current);
            if (current.status !== "open") stopPolling();
        } else if (request.value?.status === "open") {
            request.value = { ...request.value, status: "expired" };
            stopPolling();
        }
    } catch {
        // Polling failure does not erase current state.
    }
};
const loadRoute = async (current: NonNullable<typeof request.value>) => {
    if (
        current.origin_lat === undefined ||
        current.origin_lon === undefined ||
        current.destination_lat === undefined ||
        current.destination_lon === undefined
    )
        return;
    const key = `${current.origin_lat},${current.origin_lon};${current.destination_lat},${current.destination_lon}`;
    if (key === routeRequestKey) return;
    routeRequestKey = key;
    try {
        const route = await locations.route(
            current.origin_lat,
            current.origin_lon,
            current.destination_lat,
            current.destination_lon,
        );
        routeCoordinates.value = route.coordinates;
    } catch {
        routeCoordinates.value = [];
    }
};
const startPolling = () => {
    if (!pollTimer) pollTimer = setInterval(() => void refresh(), 5000);
};
const stopPolling = () => {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = undefined;
};
const onVisibility = () => {
    if (document.hidden) stopPolling();
    else if (request.value?.status === "open") {
        void refresh();
        startPolling();
    }
};
const cancel = async () => {
    if (!request.value) return;
    try {
        request.value = await requests.cancel(request.value.id);
        cancelDialog.value = false;
        stopPolling();
        quasar.notify({ type: "positive", message: "Pedido cancelado" });
    } catch {
        quasar.notify({ type: "negative", message: "No pudimos cancelar el pedido" });
    }
};
const retry = () => router.replace("/ride-requests/new");
onMounted(async () => {
    await refresh();
    if (request.value?.status === "open") startPolling();
    document.addEventListener("visibilitychange", onVisibility);
});
onBeforeUnmount(() => {
    stopPolling();
    document.removeEventListener("visibilitychange", onVisibility);
});
</script>

<template>
    <QPage class="q-pa-md page-background">
        <div class="page-shell ride-request-waiting">
            <QBtn no-caps flat icon="arrow_back" label="Inicio" to="/" class="q-mb-sm" />
            <div class="section-kicker">Tu pedido</div>
            <div class="text-h5 q-mb-md">
                {{
                    request?.status === "accepted"
                        ? "Conductor encontrado"
                        : request?.status === "open"
                          ? "Buscando conductor…"
                          : "Pedido finalizado"
                }}
            </div>
            <QCard v-if="request" class="trip-card q-pa-md">
                <LocalityMapPicker
                    :readonly="true"
                    :show-locations="false"
                    map-height="32vh"
                    :initial-origin="
                        request.origin_lat && request.origin_lon
                            ? { lat: request.origin_lat, lon: request.origin_lon }
                            : undefined
                    "
                    :initial-destination="
                        request.destination_lat && request.destination_lon
                            ? { lat: request.destination_lat, lon: request.destination_lon }
                            : undefined
                    "
                    :route-coordinates="routeCoordinates"
                />
                <div class="waiting-route q-mt-md">
                    <div class="waiting-route__row">
                        <span class="waiting-route__dot" />
                        <span class="waiting-route__text">
                            <small>Desde</small>
                            <strong>{{ request.origin_address || request.origin_name }}</strong>
                        </span>
                    </div>
                    <div class="waiting-route__divider" />
                    <div class="waiting-route__row">
                        <span class="waiting-route__dot waiting-route__dot--destination" />
                        <span class="waiting-route__text">
                            <small>Hasta</small>
                            <strong>{{
                                request.destination_address || request.destination_name
                            }}</strong>
                        </span>
                    </div>
                </div>
                <div class="price q-mt-md">
                    $ {{ request.max_price_per_seat }} <span class="price-unit">/asiento</span>
                </div>
                <div v-if="request.status === 'open'" class="form-helper q-mt-sm">
                    {{ elapsed }} · Te avisamos cuando un conductor acepte.
                </div>
                <div v-if="request.status === 'accepted'" class="q-mt-md">
                    <div class="status-badge status-badge--positive">Pedido aceptado</div>
                    <div class="text-subtitle1 q-mt-md">
                        {{ request.accepted_driver_name || "Conductor" }}
                    </div>
                    <div v-if="request.accepted_driver_total_ratings" class="form-helper">
                        ★ {{ request.accepted_driver_average_score }} ·
                        {{ request.accepted_driver_total_ratings }} viajes
                    </div>
                    <div class="trip-card__meta q-mt-sm">
                        {{ request.accepted_vehicle_make }} {{ request.accepted_vehicle_model }} ·
                        {{ request.accepted_vehicle_license_plate }}
                    </div>
                    <QBtn
                        no-caps
                        color="primary"
                        class="q-mt-md full-width"
                        label="Ver detalle del viaje"
                        :to="`/trips/${request.accepted_trip_id}`"
                    />
                </div>
                <div
                    v-if="['cancelled', 'expired', 'completed'].includes(request.status)"
                    class="q-mt-md"
                >
                    <div class="status-badge status-badge--neutral">
                        {{
                            request.status === "cancelled"
                                ? "Pedido cancelado"
                                : request.status === "expired"
                                  ? "Pedido expirado"
                                  : "Viaje completado"
                        }}
                    </div>
                    <div class="form-helper q-mt-sm">Podés pedir otro viaje cuando quieras.</div>
                    <QBtn
                        no-caps
                        color="primary"
                        class="q-mt-md full-width"
                        label="Pedir otro viaje"
                        @click="retry"
                    />
                </div>
                <div v-if="request.status === 'open'" class="q-mt-md">
                    <QBtn
                        no-caps
                        outline
                        color="negative"
                        class="full-width"
                        label="Cancelar pedido"
                        @click="cancelDialog = true"
                    />
                </div>
            </QCard>
            <QCard v-else class="trip-card q-pa-lg text-center">
                <div class="text-h6">Este pedido ya no está activo</div>
                <div class="form-helper q-mt-sm">Podés crear un pedido nuevo cuando quieras.</div>
                <QBtn
                    no-caps
                    color="primary"
                    class="q-mt-md"
                    label="Pedir otro viaje"
                    @click="retry"
                />
            </QCard>
            <QDialog v-model="cancelDialog">
                <QCard class="q-pa-md">
                    <div class="text-h6">¿Cancelar pedido?</div>
                    <div class="form-helper q-mt-sm">Vas a poder pedir otro viaje después.</div>
                    <div class="row justify-end q-gutter-sm q-mt-md">
                        <QBtn v-close-popup no-caps flat label="Volver" /><QBtn
                            no-caps
                            color="negative"
                            label="Cancelar pedido"
                            @click="cancel"
                        />
                    </div>
                </QCard>
            </QDialog>
        </div>
    </QPage>
</template>

<style scoped>
.waiting-route {
    border-top: 1px solid var(--vamo-border);
    padding-top: 14px;
}
.waiting-route__row {
    align-items: center;
    display: flex;
    gap: 12px;
}
.waiting-route__dot {
    background: var(--vamo-ink);
    border-radius: 50%;
    flex-shrink: 0;
    height: 10px;
    width: 10px;
}
.waiting-route__dot--destination {
    background: transparent;
    border: 3px solid var(--vamo-ink);
    border-radius: 3px;
    height: 11px;
    width: 11px;
}
.waiting-route__divider {
    border-left: 2px dotted var(--vamo-border-strong);
    height: 16px;
    margin-left: 4px;
}
.waiting-route__text {
    display: flex;
    flex-direction: column;
    min-width: 0;
}
.waiting-route__text small {
    color: var(--vamo-muted);
    font-size: 0.76rem;
    font-weight: 600;
}
.waiting-route__text strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
