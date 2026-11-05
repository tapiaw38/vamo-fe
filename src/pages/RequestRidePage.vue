<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import {
    QBtn,
    QCard,
    QDate,
    QDialog,
    QExpansionItem,
    QInput,
    QPage,
    QTime,
    useQuasar,
} from "quasar";
import { useRoute, useRouter } from "vue-router";
import RouteAutocompleteBox from "../components/RouteAutocompleteBox.vue";
import { useRideRequests } from "../composables/useRideRequests";
import type { RouteLocation } from "../types/routeLocation";

const quasar = useQuasar();
const route = useRoute();
const router = useRouter();
const requests = useRideRequests();
const quote = ref<Awaited<ReturnType<typeof requests.quote>> | null>(null);
const quoteLoading = ref(false);
const scheduleDialog = ref(false);
const scheduleDate = ref("");
const scheduleTime = ref("");
const form = reactive({
    origin: { id: "", name: "", address: "" } as RouteLocation,
    destination: { id: "", name: "", address: "" } as RouteLocation,
    requested_at: "",
    notes: "",
});

const refreshQuote = async () => {
    if (!form.origin.id || !form.destination.id) {
        quote.value = null;
        return;
    }
    quoteLoading.value = true;
    try {
        quote.value = await requests.quote(
            form.origin.id,
            form.destination.id,
            form.origin.lat !== undefined &&
                form.origin.lon !== undefined &&
                form.destination.lat !== undefined &&
                form.destination.lon !== undefined
                ? {
                      origin_lat: form.origin.lat,
                      origin_lon: form.origin.lon,
                      destination_lat: form.destination.lat,
                      destination_lon: form.destination.lon,
                  }
                : undefined,
        );
    } catch {
        quote.value = null;
    } finally {
        quoteLoading.value = false;
    }
};
watch(
    () => [
        form.origin.id,
        form.destination.id,
        form.origin.lat,
        form.origin.lon,
        form.destination.lat,
        form.destination.lon,
    ],
    () => void refreshQuote(),
);
const scheduleLabel = computed(() => {
    if (!form.requested_at) return "Salir ahora";
    const date = new Date(form.requested_at);
    return `Sal ${date.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}, ${date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`;
});
const openSchedule = () => {
    const date = form.requested_at ? new Date(form.requested_at) : new Date();
    scheduleDate.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    scheduleTime.value = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    scheduleDialog.value = true;
};
const confirmSchedule = () => {
    if (scheduleDate.value && scheduleTime.value)
        form.requested_at = `${scheduleDate.value}T${scheduleTime.value}`;
    scheduleDialog.value = false;
};
const submit = async () => {
    if (!form.origin.id || !form.destination.id) {
        quasar.notify({ type: "warning", message: "Elegí origen y destino." });
        return;
    }
    try {
        const created = await requests.create({
            origin_locality_id: form.origin.id,
            destination_locality_id: form.destination.id,
            origin_lat: form.origin.lat,
            origin_lon: form.origin.lon,
            destination_lat: form.destination.lat,
            destination_lon: form.destination.lon,
            origin_address: form.origin.address,
            destination_address: form.destination.address,
            requested_at: form.requested_at ? new Date(form.requested_at).toISOString() : "",
            notes: form.notes,
        });
        await router.push(`/ride-requests/${created.id}/waiting`);
    } catch (error: unknown) {
        const response = (
            error as {
                response?: {
                    status?: number;
                    data?: { message?: string; data?: { active_request_id?: string } };
                };
            }
        ).response;
        if (response?.status === 409 && response.data?.data?.active_request_id) {
            await router.push(`/ride-requests/${response.data.data.active_request_id}/waiting`);
            return;
        }
        quasar.notify({
            type: "negative",
            message: response?.data?.message || "No se pudo publicar el pedido",
        });
    }
};
onMounted(async () => {
    try {
        const active = await requests.active();
        if (active) return void router.replace(`/ride-requests/${active.id}/waiting`);
    } catch {
        // Form remains usable if active lookup fails.
    }
    const query = route.query;
    if (query.destination_locality_id && query.destination_name) {
        form.destination = {
            id: String(query.destination_locality_id),
            name: String(query.destination_name),
            address: String(query.destination_address || query.destination_name),
            lat: Number(query.destination_lat) || undefined,
            lon: Number(query.destination_lon) || undefined,
        };
    }
});
</script>

<template>
    <QPage class="q-pa-md page-background">
        <div class="page-shell request-ride-page">
            <div class="request-ride-page__head">
                <QBtn flat round dense icon="arrow_back" to="/" aria-label="Volver al inicio" />
                <div class="text-h6">Planificá tu viaje</div>
            </div>
            <QBtn
                no-caps
                outline
                color="primary"
                icon="schedule"
                :label="scheduleLabel"
                class="request-ride-page__schedule"
                @click="openSchedule"
            />
            <RouteAutocompleteBox
                v-model:origin="form.origin"
                v-model:destination="form.destination"
                auto-locate
            />
            <div v-if="quoteLoading" class="form-helper q-mt-md">Calculando precio…</div>
            <div v-else-if="quote" class="trip-card q-pa-md q-mt-md">
                <div class="form-helper">
                    {{
                        quote.fare_kind === "urban"
                            ? "Tarifa urbana"
                            : "Precio estimado por asiento"
                    }}
                </div>
                <div class="price">
                    $ {{ quote.price_per_seat }}
                    <span class="price-unit">{{ quote.currency }} / asiento</span>
                </div>
                <div class="trip-card__meta q-mt-xs">
                    {{
                        quote.fare_kind === "urban"
                            ? `Viaje dentro de ${form.origin.name}`
                            : `${quote.distance_km.toFixed(1)} km · Base $${quote.base_price} + ${quote.distance_km.toFixed(1)} km × $${quote.price_per_km}`
                    }}
                </div>
            </div>
            <QExpansionItem label="Agregar notas" icon="notes" dense class="q-mt-md"
                ><QInput
                    v-model="form.notes"
                    label="Notas para el conductor"
                    type="textarea"
                    autogrow
                    outlined
                    class="q-mt-sm"
            /></QExpansionItem>
            <QBtn
                no-caps
                unelevated
                color="primary"
                class="q-mt-md full-width request-ride-page__submit"
                label="Pedir viaje"
                :disable="!form.origin.id || !form.destination.id"
                :loading="requests.loading.value"
                @click="submit"
            />
            <div
                v-if="!form.origin.id || !form.destination.id"
                class="form-helper text-center q-mt-sm"
            >
                Elegí origen y destino para pedir el viaje.
            </div>
            <QDialog v-model="scheduleDialog"
                ><QCard class="q-pa-md request-ride-page__dialog"
                    ><div class="text-h6">¿Cuándo querés salir?</div>
                    <QDate
                        v-model="scheduleDate"
                        mask="YYYY-MM-DD"
                        color="primary"
                        class="q-mt-sm" /><QTime
                        v-model="scheduleTime"
                        mask="HH:mm"
                        format24h
                        color="primary"
                        class="q-mt-sm" />
                    <div class="row justify-end q-gutter-sm q-mt-md">
                        <QBtn no-caps flat label="Cancelar" @click="scheduleDialog = false" /><QBtn
                            no-caps
                            color="primary"
                            label="Guardar horario"
                            @click="confirmSchedule"
                        /></div></QCard
            ></QDialog>
        </div>
    </QPage>
</template>

<style scoped>
.request-ride-page {
    padding-bottom: 32px;
}
.request-ride-page__head {
    align-items: center;
    display: flex;
    gap: 6px;
    margin-bottom: 14px;
}
.request-ride-page__schedule {
    border-radius: 999px;
    margin-bottom: 14px;
}
.request-ride-page__submit {
    min-height: 52px;
}
.request-ride-page__dialog {
    width: min(94vw, 520px);
}
</style>
