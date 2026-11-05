<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import {
    QBtn,
    QCard,
    QDate,
    QDialog,
    QExpansionItem,
    QInput,
    QPage,
    QSelect,
    QTime,
    useQuasar,
} from "quasar";
import RouteAutocompleteBox from "../components/RouteAutocompleteBox.vue";
import { useCompanies } from "../composables/useCompanies";
import { useTrips } from "../composables/useTrips";
import { useVehicles } from "../composables/useVehicles";
import type { RouteLocation } from "../types/routeLocation";

const quasar = useQuasar();
const companies = useCompanies();
const trips = useTrips();
const vehicles = useVehicles();
const scheduleDialog = ref(false);
const scheduleDate = ref("");
const scheduleTime = ref("");
const publisher = ref("driver");
const form = reactive({
    origin: { id: "", name: "", address: "" } as RouteLocation,
    destination: { id: "", name: "", address: "" } as RouteLocation,
    departureAt: "",
    price: "",
    seats: 1,
    vehicleID: "",
    driverProfileID: "",
    companyID: "",
    bookingMode: "automatic" as "automatic" | "manual",
    notes: "",
});
const dispatchCompanies = computed(() =>
    companies.items.value.filter((company) =>
        ["owner", "admin", "dispatcher"].includes(
            companies.members.value.find((member) => member.company_id === company.id)?.role ?? "",
        ),
    ),
);
const companyVehicles = computed(() =>
    companies.vehicles.value.map((item) => ({
        label: `${item.make} ${item.model} · ${item.authorized_seats} asientos`,
        value: item.id,
    })),
);
const ownVehicleOptions = computed(() =>
    vehicles.items.value.map((item) => ({
        label: `${item.make} ${item.model} · ${item.authorized_seats} asientos`,
        value: item.id,
    })),
);
const driverOptions = computed(() =>
    companies.members.value
        .filter(
            (member) =>
                member.role === "driver" && member.status === "active" && member.driver_profile_id,
        )
        .map((member) => ({ label: member.user_id, value: member.driver_profile_id })),
);
const selectedVehicleCapacity = computed(
    () =>
        (publisher.value === "driver" ? vehicles.items.value : companies.vehicles.value).find(
            (item) => item.id === form.vehicleID,
        )?.authorized_seats ?? 0,
);
const scheduleLabel = computed(() => {
    if (!form.departureAt) return "Elegir horario de salida";
    const date = new Date(form.departureAt);
    return `Salís ${date.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}, ${date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`;
});
const openSchedule = () => {
    const date = form.departureAt ? new Date(form.departureAt) : new Date();
    scheduleDate.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    scheduleTime.value = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    scheduleDialog.value = true;
};
const confirmSchedule = () => {
    if (scheduleDate.value && scheduleTime.value)
        form.departureAt = `${scheduleDate.value}T${scheduleTime.value}`;
    scheduleDialog.value = false;
};
const choosePublisher = async (value: string) => {
    form.vehicleID = "";
    form.driverProfileID = "";
    form.companyID = value === "driver" ? "" : value;
    if (form.companyID) await companies.loadCompanyResources(form.companyID);
};
const onVehicleChange = (id: string) => {
    form.vehicleID = id;
    form.seats = selectedVehicleCapacity.value || 1;
};
const publish = async () => {
    if (!form.origin.id || !form.destination.id || !form.vehicleID) return;
    if (selectedVehicleCapacity.value && form.seats > selectedVehicleCapacity.value) {
        quasar.notify({
            type: "warning",
            message: "Los asientos no pueden superar la capacidad del vehículo.",
        });
        return;
    }
    try {
        await trips.create({
            vehicle_id: form.vehicleID,
            origin_locality_id: form.origin.id,
            destination_locality_id: form.destination.id,
            departure_at: new Date(form.departureAt || Date.now()).toISOString(),
            price_per_seat: form.price,
            total_seats: form.seats,
            booking_mode: form.bookingMode,
            notes: form.notes,
            ...(publisher.value === "driver"
                ? {}
                : {
                      publisher_type: "company",
                      company_id: form.companyID,
                      driver_profile_id: form.driverProfileID,
                  }),
        });
        quasar.notify({ type: "positive", message: "Viaje publicado" });
    } catch {
        quasar.notify({ type: "negative", message: "No se pudo publicar el viaje" });
    }
};
onMounted(async () => {
    await vehicles.load();
    await companies.loadMine();
    if (companies.items.value.length)
        await companies.loadCompanyResources(companies.items.value[0].id);
});
</script>

<template>
    <QPage class="q-pa-md page-background">
        <div class="page-shell publish-trip-page">
            <div class="publish-trip-page__head">
                <QBtn
                    flat
                    round
                    dense
                    icon="arrow_back"
                    to="/trips/mine"
                    aria-label="Volver a mis viajes"
                />
                <div>
                    <div class="section-kicker">Conducción</div>
                    <div class="text-h6">Publicar viaje</div>
                </div>
            </div>
            <QCard class="route-form q-pa-md">
                <QSelect
                    v-if="dispatchCompanies.length"
                    v-model="publisher"
                    label="Publicar como"
                    :options="[
                        { label: 'Particular', value: 'driver' },
                        ...dispatchCompanies.map((item) => ({
                            label: item.display_name,
                            value: item.id,
                        })),
                    ]"
                    emit-value
                    map-options
                    outlined
                    @update:model-value="choosePublisher"
                />
                <QBtn
                    no-caps
                    outline
                    color="primary"
                    icon="schedule"
                    :label="scheduleLabel"
                    class="publish-trip-page__schedule q-mt-sm"
                    @click="openSchedule"
                />
                <RouteAutocompleteBox
                    v-model:origin="form.origin"
                    v-model:destination="form.destination"
                    class="q-mt-md"
                />
                <div class="form-helper q-mt-sm">
                    Salís desde <strong>{{ form.origin.name || "elegí una ubicación" }}</strong> ·
                    Llegás a <strong>{{ form.destination.name || "elegí una ubicación" }}</strong>
                </div>
                <QCard flat class="publish-trip-page__details q-mt-md">
                    <div class="text-subtitle1">Detalles del viaje</div>
                    <QInput
                        v-model="form.price"
                        class="q-mt-sm"
                        label="Precio por asiento"
                        type="number"
                        outlined
                        dense
                        prefix="$"
                    />
                    <QInput
                        v-model.number="form.seats"
                        class="q-mt-sm"
                        label="Asientos"
                        type="number"
                        min="1"
                        :max="selectedVehicleCapacity || undefined"
                        outlined
                        dense
                    />
                    <QSelect
                        v-model="form.vehicleID"
                        class="q-mt-sm"
                        label="Vehículo"
                        :options="publisher === 'driver' ? ownVehicleOptions : companyVehicles"
                        emit-value
                        map-options
                        outlined
                        dense
                        @update:model-value="onVehicleChange"
                    />
                    <QSelect
                        v-if="publisher !== 'driver'"
                        v-model="form.driverProfileID"
                        class="q-mt-sm"
                        label="Conductor"
                        :options="driverOptions"
                        emit-value
                        map-options
                        outlined
                        dense
                    />
                    <QSelect
                        v-model="form.bookingMode"
                        class="q-mt-sm"
                        label="Modo de reserva"
                        :options="[
                            { label: 'Automática', value: 'automatic' },
                            { label: 'Manual', value: 'manual' },
                        ]"
                        emit-value
                        map-options
                        outlined
                        dense
                    />
                    <QExpansionItem label="Agregar notas" icon="notes" dense class="q-mt-sm"
                        ><QInput
                            v-model="form.notes"
                            label="Observaciones"
                            type="textarea"
                            autogrow
                            outlined
                            dense
                    /></QExpansionItem>
                </QCard>
                <QBtn
                    no-caps
                    unelevated
                    class="q-mt-md full-width publish-trip-page__submit"
                    color="primary"
                    label="Publicar viaje"
                    :disable="!form.origin.id || !form.destination.id || !form.vehicleID"
                    :loading="trips.loading.value"
                    @click="publish"
                />
                <div
                    v-if="!form.origin.id || !form.destination.id || !form.vehicleID"
                    class="form-helper text-center q-mt-sm"
                >
                    Elegí origen, destino y vehículo para publicar.
                </div>
            </QCard>
            <QDialog v-model="scheduleDialog"
                ><QCard class="q-pa-md publish-trip-page__dialog"
                    ><div class="text-h6">¿Cuándo salís?</div>
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
.publish-trip-page__head {
    align-items: center;
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
}
.publish-trip-page__schedule {
    border-radius: 999px;
}
.publish-trip-page__details {
    background: var(--vamo-paper);
    border: 1px solid var(--vamo-border);
    border-radius: 18px;
    padding: 16px;
}
.publish-trip-page__submit {
    min-height: 52px;
}
.publish-trip-page__dialog {
    width: min(92vw, 390px);
}
</style>
