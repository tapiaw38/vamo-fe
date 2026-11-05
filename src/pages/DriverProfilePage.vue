<script setup lang="ts">
import { onMounted, ref } from "vue";
import { QBtn, QCard, QInput, QPage, QSelect, QToggle, useQuasar } from "quasar";
import { useDrivers } from "../composables/useDrivers";
import { labelFor } from "../utils/labels";

const quasar = useQuasar(); const drivers = useDrivers(); const licenseNumber = ref(""); const submitForReview = ref(false); const available = ref(false);
onMounted(async () => { try { await drivers.load(); licenseNumber.value = drivers.profile.value?.license_number ?? ""; available.value = drivers.profile.value?.is_available ?? false; } catch { /* empty form */ } });
const save = async () => { try { await drivers.save({ license_number: licenseNumber.value, submit_for_review: submitForReview.value }); quasar.notify({ type: "positive", message: "Perfil guardado" }); } catch { quasar.notify({ type: "negative", message: "No se pudo guardar el perfil" }); } };
const toggleAvailability = async (value: boolean) => { try { await drivers.setAvailability(value); available.value = value; } catch { available.value = !value; quasar.notify({ type: "negative", message: "No se pudo actualizar disponibilidad" }); } };
const statusClass = (value?: string) => value === "verified" ? "positive" : value === "pending_review" ? "warning" : value === "suspended" ? "negative" : "neutral";
</script>

<template>
    <QPage class="q-pa-md page-background"><div class="page-shell">
        <QBtn no-caps flat icon="arrow_back" label="Perfil" to="/profile" class="q-mb-sm" />
        <div class="section-kicker">Conducción</div><div class="text-h5 q-mb-md">Perfil de conductor</div>
        <QCard class="route-form q-pa-md">
            <div class="row items-center justify-between q-mb-md"><div class="text-h6">Datos de habilitación</div><span class="status-badge" :class="`status-badge--${statusClass(drivers.profile.value?.status)}`">{{ labelFor(drivers.profile.value?.status || "draft") }}</span></div>
            <QInput v-model="licenseNumber" label="Número de licencia" />
            <QSelect v-model="submitForReview" class="q-mt-md" label="Enviar a revisión" :options="[{ label: 'No', value: false }, { label: 'Sí', value: true }]" emit-value map-options />
            <QToggle v-model="available" class="q-mt-md" label="Disponible para pedidos" @update:model-value="toggleAvailability" />
            <div class="trip-card__meta q-mt-sm">Cuando estés disponible, vas a poder ver pedidos cercanos.</div>
            <QBtn no-caps class="q-mt-md full-width" color="primary" label="Guardar perfil" :loading="drivers.loading.value" @click="save" />
        </QCard>
        <QBtn no-caps outline color="primary" label="Administrar vehículos" to="/vehicles" class="q-mt-md full-width" />
    </div></QPage>
</template>
