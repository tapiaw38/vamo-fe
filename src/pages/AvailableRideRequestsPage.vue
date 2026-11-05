<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { QBtn, QCard, QPage, QSelect, useQuasar } from "quasar";
import { useRideRequests } from "../composables/useRideRequests";
import { useLocations } from "../composables/useLocations";
import { useDrivers } from "../composables/useDrivers";
import { useVehicles } from "../composables/useVehicles";

const requests = useRideRequests(); const locations = useLocations(); const drivers = useDrivers(); const vehicles = useVehicles(); const quasar = useQuasar(); const provinceID = ref(""); const origin = ref(""); const selectedVehicles = reactive<Record<string, string>>({});
onMounted(async () => { await drivers.load(); await vehicles.load(); await locations.loadProvinces(); });
const load = async () => { if (origin.value) await requests.list(origin.value); };
const provinces = () => locations.provinces.value.map((item) => ({ label: item.name, value: item.id })); const originLocalities = () => locations.originLocalities.value.map((item) => ({ label: item.name, value: item.id }));
const loadOrigin = async (id: string) => { origin.value = ""; await locations.loadOriginLocalities(id); };
const vehicleOptions = () => vehicles.items.value.map((item) => ({ label: `${item.make} ${item.model} · ${item.license_plate}`, value: item.id }));
const accept = async (id: string) => { try { const vehicleID = selectedVehicles[id] || vehicles.items.value[0]?.id; const result = await requests.accept(id, vehicleID); quasar.notify({ type: "positive", message: `Pedido tomado. Viaje ${result.trip_id} creado` }); await load(); } catch { quasar.notify({ type: "negative", message: "El pedido ya no está disponible" }); } };
</script>

<template>
    <QPage class="q-pa-md page-background"><div class="page-shell">
        <QBtn no-caps flat icon="arrow_back" label="Inicio" to="/" class="q-mb-sm" />
        <div class="section-kicker">Conducción</div><div class="text-h5 q-mb-md">Pedidos cercanos</div>
        <QCard v-if="!drivers.profile.value?.is_available" class="trip-card q-pa-lg text-center"><div class="text-h6">Activá tu disponibilidad</div><div class="trip-card__meta q-mt-sm">Cuando estés disponible vas a poder ver pedidos en tu zona.</div><QBtn no-caps class="q-mt-md" color="primary" label="Activar disponibilidad" to="/driver-profile" /></QCard>
        <template v-else>
            <QCard class="route-form q-pa-md"><QSelect v-model="provinceID" label="Provincia de origen" :options="provinces()" emit-value map-options @update:model-value="loadOrigin" /><QSelect v-model="origin" class="q-mt-sm" label="Localidad de origen" :options="originLocalities()" emit-value map-options :disable="!provinceID" /><QBtn no-caps color="primary" class="q-mt-md full-width" label="Buscar pedidos" :disable="!origin" @click="load" /></QCard>
            <QCard v-for="item in requests.items.value" :key="item.id" class="trip-card q-mt-md"><div class="trip-card__top"><div class="price">$ {{ item.max_price_per_seat }}<span class="price-unit">/asiento máximo</span></div><span class="status-badge status-badge--warning">Abierto</span></div><div class="trip-card__ticket"><div class="route-stop__label">{{ item.origin_name || item.origin_locality_id }} → {{ item.destination_name || item.destination_locality_id }}</div><div class="trip-card__meta q-mt-sm">{{ item.seats }} asiento(s) · {{ new Date(item.requested_at).toLocaleString("es-AR") }}</div><QSelect v-if="vehicles.items.value.length > 1" v-model="selectedVehicles[item.id]" class="q-mt-md" label="Vehículo" :options="vehicleOptions()" emit-value map-options /><QBtn no-caps color="primary" class="q-mt-md full-width" label="Tomar viaje" @click="accept(item.id)" /></div></QCard>
            <QCard v-if="!requests.items.value.length" class="trip-card q-pa-lg q-mt-md text-center"><div class="text-h6">No hay pedidos abiertos</div><div class="trip-card__meta q-mt-sm">Probá con otra localidad o revisá más tarde.</div></QCard>
        </template>
    </div></QPage>
</template>
