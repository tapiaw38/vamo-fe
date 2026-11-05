<script setup lang="ts">
import { onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { QBtn, QCard, QInput, QPage, QSelect, useQuasar } from "quasar";
import { useCompanies } from "../../composables/useCompanies";
import { useLocations } from "../../composables/useLocations";

const router = useRouter();
const quasar = useQuasar();
const companies = useCompanies();
const locations = useLocations();
const form = reactive({
    legal_name: "",
    display_name: "",
    tax_id: "",
    province_id: "",
    locality_id: "",
    contact_email: "",
    contact_phone: "",
});
onMounted(() => locations.loadProvinces());
const provinces = () =>
    locations.provinces.value.map((item) => ({ label: item.name, value: item.id }));
const localities = () =>
    locations.localities.value.map((item) => ({ label: item.name, value: item.id }));
const changeProvince = async (id: string) => {
    form.locality_id = "";
    await locations.loadLocalities(id);
};
const submit = async () => {
    try {
        const company = await companies.create(form);
        await router.push(`/company?company=${company.id}`);
    } catch {
        quasar.notify({ type: "negative", message: "No se pudo crear la empresa" });
    }
};
</script>

<template>
    <QPage class="q-pa-md"
        ><div class="page-shell">
            <QBtn flat no-caps icon="arrow_back" label="Perfil" to="/profile" class="q-mb-sm" />
            <QCard class="route-form q-pa-md">
                <div class="section-kicker">VAMO! Empresas</div>
                <div class="text-h5 q-mb-md">Crear empresa</div>
                <QInput v-model="form.legal_name" label="Razón social" />
                <QInput v-model="form.display_name" label="Nombre visible" />
                <QInput v-model="form.tax_id" label="CUIT" />
                <QSelect
                    v-model="form.province_id"
                    label="Provincia"
                    :options="provinces()"
                    emit-value
                    map-options
                    @update:model-value="changeProvince"
                />
                <QSelect
                    v-model="form.locality_id"
                    label="Localidad"
                    :options="localities()"
                    emit-value
                    map-options
                    :disable="!form.province_id"
                />
                <QInput v-model="form.contact_email" label="Correo de contacto" type="email" />
                <QInput v-model="form.contact_phone" label="Teléfono de contacto" />
                <QBtn
                    class="q-mt-md full-width"
                    color="primary"
                    no-caps
                    label="Crear empresa"
                    :loading="companies.loading.value"
                    @click="submit"
                />
            </QCard></div
    ></QPage>
</template>
