<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { QBtn, QCard, QInput, QPage, QSelect, useQuasar } from "quasar";
import { useCompanies } from "../../composables/useCompanies";
import { labelFor } from "../../utils/labels";
import { useLocations } from "../../composables/useLocations";

const companies = useCompanies(); const locations = useLocations(); const quasar = useQuasar(); const editing = ref(false);
const form = reactive({ legal_name: "", display_name: "", tax_id: "", province_id: "", locality_id: "", contact_email: "", contact_phone: "" });
const statusClass = (value?: string) => value === "verified" ? "positive" : value === "pending_review" ? "warning" : value === "suspended" ? "negative" : "neutral";
const syncForm = async () => { const company = companies.currentCompany.value; if (!company) return; Object.assign(form, company); await locations.loadLocalities(company.province_id); };
onMounted(async () => { try { await locations.loadProvinces(); await companies.loadMine(); if (companies.currentCompany.value) { await companies.loadDetails(); await syncForm(); } } catch { quasar.notify({ type: "negative", message: "No se pudo cargar la empresa" }); } });
const changeProvince = async (id: string) => { form.locality_id = ""; await locations.loadLocalities(id); };
const save = async () => { try { await companies.update({ ...form }); editing.value = false; quasar.notify({ type: "positive", message: "Datos de empresa actualizados" }); } catch { quasar.notify({ type: "negative", message: "No se pudieron actualizar los datos" }); } };
</script>

<template>
    <QPage class="q-pa-md"><div class="page-shell">
        <QBtn no-caps flat icon="arrow_back" label="Perfil" to="/profile" class="q-mb-sm" />
        <template v-if="companies.currentCompany.value">
            <div class="section-kicker">Panel de empresa</div><div class="text-h4 q-mb-md">{{ companies.currentCompany.value.display_name }}</div>
            <QCard class="trip-card q-mb-md"><div class="trip-card__top"><div class="text-h6">{{ companies.currentCompany.value.legal_name }}</div><div class="trip-card__meta">CUIT {{ companies.currentCompany.value.tax_id }}</div></div><div class="trip-card__ticket"><span class="status-badge" :class="`status-badge--${statusClass(companies.currentCompany.value.verification_status)}`">{{ labelFor(companies.currentCompany.value.verification_status) }}</span><div class="trip-card__meta q-mt-sm">{{ companies.currentCompany.value.contact_email || "Sin correo de contacto" }}</div></div></QCard>
            <QBtn no-caps outline color="primary" label="Editar datos" class="q-mb-md full-width" @click="editing = true" />
            <QCard v-if="editing" class="route-form q-pa-md q-mb-md"><div class="text-h6 q-mb-md">Editar datos de empresa</div><QInput v-model="form.legal_name" label="Razón social" /><QInput v-model="form.display_name" label="Nombre visible" /><QInput v-model="form.tax_id" label="CUIT" /><QSelect v-model="form.province_id" label="Provincia" :options="locations.provinces.value.map((item) => ({ label: item.name, value: item.id }))" emit-value map-options @update:model-value="changeProvince" /><QSelect v-model="form.locality_id" label="Localidad" :options="locations.localities.value.map((item) => ({ label: item.name, value: item.id }))" emit-value map-options :disable="!form.province_id" /><QInput v-model="form.contact_email" label="Correo de contacto" type="email" /><QInput v-model="form.contact_phone" label="Teléfono de contacto" /><div class="row q-gutter-sm q-mt-md"><QBtn no-caps color="primary" label="Guardar cambios" :loading="companies.loading.value" @click="save" /><QBtn no-caps flat label="Cancelar" @click="editing = false" /></div></QCard>
            <div class="column q-gutter-sm"><QBtn no-caps color="primary" label="Gestionar miembros" to="/company/members" /><QBtn no-caps outline color="primary" label="Gestionar vehículos" to="/company/vehicles" /><QBtn no-caps flat color="primary" label="Ver mis viajes" to="/trips/mine" /></div>
        </template>
        <QCard v-else class="trip-card q-pa-lg text-center"><div class="text-h6">Todavía no tenés una empresa</div><div class="trip-card__meta q-mt-sm">Creá una empresa para administrar miembros y vehículos.</div><QBtn no-caps class="q-mt-md" color="primary" label="Crear empresa" to="/company/create" /></QCard>
    </div></QPage>
</template>
