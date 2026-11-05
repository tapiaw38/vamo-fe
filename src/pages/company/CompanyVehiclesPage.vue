<script setup lang="ts">
import { onMounted, reactive } from "vue";
import { QBtn, QCard, QInput, QPage, QSelect, useQuasar } from "quasar";
import { useCompanies } from "../../composables/useCompanies";
import { labelFor, vehicleTypeOptions } from "../../utils/labels";

const companies = useCompanies();
const quasar = useQuasar();
const form = reactive({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    license_plate: "",
    authorized_seats: 4,
    vehicle_type: "car",
    photo_url: "",
});
onMounted(async () => {
    await companies.loadMine();
    if (companies.currentCompany.value) await companies.loadVehicles();
});
const add = async () => {
    try {
        await companies.addVehicle({ ...form });
        Object.assign(form, { make: "", model: "", license_plate: "" });
        quasar.notify({ type: "positive", message: "Vehículo agregado" });
    } catch {
        quasar.notify({ type: "negative", message: "No se pudo agregar el vehículo" });
    }
};
const statusClass = (value: string) => value === "verified" ? "positive" : value === "rejected" || value === "suspended" ? "negative" : value === "pending_review" ? "warning" : "neutral";
</script>

<template>
    <QPage class="q-pa-md"
        ><div class="page-shell">
            <QBtn flat no-caps icon="arrow_back" label="Empresa" to="/company" class="q-mb-sm" />
            <div class="section-kicker">Flota</div><div class="text-h5 q-mb-md">Vehículos de empresa</div>
            <QCard class="route-form q-pa-md q-mb-md"
                ><div class="row q-col-gutter-sm">
                    <QInput v-model="form.make" class="col-6" label="Marca" /><QInput
                        v-model="form.model"
                        class="col-6"
                        label="Modelo"
                    /><QInput
                        v-model.number="form.year"
                        class="col-6"
                        label="Año"
                        type="number"
                    /><QInput v-model="form.license_plate" class="col-6" label="Patente" /><QInput
                        v-model.number="form.authorized_seats"
                        class="col-6"
                        label="Asientos habilitados"
                        type="number"
                    /><QInput v-model="form.photo_url" class="col-12" label="URL de foto (opcional)" /><QSelect
                        v-model="form.vehicle_type"
                        class="col-6"
                        label="Tipo"
                        :options="vehicleTypeOptions.filter((item) => item.value !== 'motorcycle')"
                        emit-value
                        map-options
                    />
                </div>
                <QBtn
                    class="q-mt-md full-width"
                    color="primary"
                    no-caps
                    label="Agregar vehículo"
                    :loading="companies.loading.value"
                    @click="add"
            /></QCard>
            <QCard
                v-for="vehicle in companies.vehicles.value"
                :key="vehicle.id"
                class="trip-card q-mb-sm"
                ><img v-if="vehicle.photo_url" :src="vehicle.photo_url" alt="Vehículo" class="vehicle-photo" /><div class="trip-card__top">
                    <div class="text-subtitle1">{{ vehicle.make }} {{ vehicle.model }}</div>
                    <div class="trip-card__meta">
                        {{ vehicle.license_plate }} · {{ labelFor(vehicle.vehicle_type) }} · {{ vehicle.authorized_seats }} asientos
                    </div>
                </div>
                <div class="trip-card__ticket">
                    <span
                        :class="[
                            'status-badge',
                            `status-badge--${statusClass(vehicle.verification_status)}`,
                        ]"
                        >{{ labelFor(vehicle.verification_status) }}</span
                    >
                </div></QCard
            >
            <QCard v-if="!companies.vehicles.value.length" class="trip-card q-pa-lg text-center">
                <div class="text-h6">Todavía no hay vehículos</div><div class="trip-card__meta q-mt-sm">Agregá el primer vehículo para publicar salidas.</div>
            </QCard>
        </div></QPage
    >
</template>

<style scoped>
.vehicle-photo { width: 100%; max-height: 190px; object-fit: cover; display: block; }
</style>
