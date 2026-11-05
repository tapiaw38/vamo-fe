<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { QBtn, QBtnToggle, QCard, QCardSection, QInput, QPage, QSelect, useQuasar } from "quasar";
import { useAuth } from "../composables/useAuth";
import { useLocations } from "../composables/useLocations";

const router = useRouter();
const quasar = useQuasar();
const auth = useAuth();
const locations = useLocations();
const locating = ref(false);
const form = ref({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    provinceID: "",
    localityID: "",
    profileType: "passenger" as "passenger" | "driver",
});
const profileTypeLabel = computed(() =>
    form.value.profileType === "passenger" ? "Pasajero" : "Conductor",
);
onMounted(() => locations.loadProvinces());
const provinceOptions = () =>
    locations.provinces.value.map((item) => ({ label: item.name, value: item.id }));
const localityOptions = () =>
    locations.localities.value.map((item) => ({ label: item.name, value: item.id }));
const changeProvince = async (value: string) => {
    form.value.localityID = "";
    await locations.loadLocalities(value);
};
const notifyLocationFallback = () => {
    quasar.notify({
        type: "warning",
        message: "No pudimos detectar tu ubicación, elegila manualmente",
    });
};
const detectLocation = () => {
    if (!navigator.geolocation) {
        notifyLocationFallback();
        return;
    }
    locating.value = true;
    navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
            try {
                const locality = await locations.nearest(coords.latitude, coords.longitude);
                if (!locality.province_id) throw new Error("nearest locality has no province");
                form.value.provinceID = locality.province_id;
                await locations.loadLocalities(locality.province_id);
                form.value.localityID = locality.id;
                quasar.notify({
                    type: "positive",
                    message: `Ubicación detectada: ${locality.name}`,
                });
            } catch {
                notifyLocationFallback();
            } finally {
                locating.value = false;
            }
        },
        () => {
            locating.value = false;
            notifyLocationFallback();
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
};
const submit = async () => {
    try {
        await auth.register({
            first_name: form.value.firstName,
            last_name: form.value.lastName,
            email: form.value.email,
            password: form.value.password,
            residence_locality_id: form.value.localityID,
            wants_to_be_driver: form.value.profileType === "driver",
        });
        await router.push(form.value.profileType === "driver" ? "/driver-profile" : "/");
    } catch {
        quasar.notify({ type: "negative", message: "No se pudo crear la cuenta" });
    }
};
</script>

<template>
    <QPage class="row justify-center page-background auth-page">
        <QCard class="auth-card">
            <QCardSection>
                <div class="section-kicker">VAMO!</div>
                <div class="text-h5 q-mt-xs">Crear cuenta</div>
                <div class="text-body2 text-grey-7 q-mb-md">Empezá a viajar entre localidades.</div>
                <QInput v-model="form.firstName" label="Nombre" outlined /><QInput
                    v-model="form.lastName"
                    label="Apellido"
                    outlined
                /><QInput v-model="form.email" label="Correo" type="email" outlined /><QInput
                    v-model="form.password"
                    label="Contraseña"
                    type="password"
                    outlined
                /><QSelect
                    v-model="form.provinceID"
                    :options="provinceOptions()"
                    label="Provincia"
                    emit-value
                    map-options
                    outlined
                    @update:model-value="changeProvince"
                /><QSelect
                    v-model="form.localityID"
                    :options="localityOptions()"
                    label="Localidad"
                    emit-value
                    map-options
                    :disable="!form.provinceID"
                    outlined
                /><div class="text-subtitle2 q-mt-md">Tipo de cuenta</div><QBtnToggle
                    v-model="form.profileType"
                    class="account-type-toggle q-mt-sm full-width"
                    spread
                    no-caps
                    color="grey-2"
                    toggle-color="primary"
                    toggle-text-color="white"
                    text-color="dark"
                    :options="[
                        { label: 'Pasajero', value: 'passenger' },
                        { label: 'Conductor', value: 'driver' },
                    ]"
                />
                <div class="form-helper q-mt-sm">
                    Elegido: <strong>{{ profileTypeLabel }}</strong>. Podés completar tu perfil de conductor después.
                </div>
                <QBtn
                    class="q-mt-md full-width"
                    outline
                    color="primary"
                    icon="my_location"
                    label="Usar mi ubicación"
                    :loading="locating"
                    @click="detectLocation"
                /><QBtn
                    class="q-mt-md full-width"
                    color="primary"
                    label="Registrarme"
                    :loading="auth.loading.value"
                    @click="submit"
                />
                <QBtn flat no-caps color="primary" label="Ya tengo una cuenta" to="/login" class="full-width q-mt-sm" />
            </QCardSection>
        </QCard>
    </QPage>
</template>

<style scoped>
.account-type-toggle :deep(.q-btn) {
    border: 1px solid var(--vamo-border);
    font-weight: 600;
}

.account-type-toggle :deep(.q-btn--active) {
    background: var(--vamo-blue) !important;
    color: #fff !important;
    font-weight: 700;
}
</style>
