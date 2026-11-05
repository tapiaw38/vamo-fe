<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import { QBtn, QCard, QInput, QPage, useQuasar } from "quasar";
import { useAdmin } from "../../composables/useAdmin";

const admin = useAdmin();
const quasar = useQuasar();
const form = reactive({
    base_price: "",
    price_per_km: "",
    urban_base_price: "",
    urban_price_per_km: "",
    currency: "ARS",
});
const intercityExample = computed(() =>
    money(Number(form.base_price || 0) + Number(form.price_per_km || 0) * 58),
);
const urbanExample = computed(() =>
    money(Number(form.urban_base_price || 0) + Number(form.urban_price_per_km || 0) * 5),
);
const money = (value: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: form.currency || "ARS" }).format(
        Number.isFinite(value) ? value : 0,
    );
const load = async () => {
    await admin.loadPricing();
    if (admin.pricing.value) Object.assign(form, admin.pricing.value);
};
const save = async () => {
    if (
        [form.base_price, form.price_per_km, form.urban_base_price, form.urban_price_per_km].some(
            (value) => Number(value) < 0 || value === "",
        )
    ) {
        quasar.notify({
            type: "warning",
            message: "Las tarifas deben ser mayores o iguales a cero.",
        });
        return;
    }
    try {
        await admin.updatePricing(form);
        quasar.notify({ type: "positive", message: "Tarifas guardadas" });
    } catch (error: unknown) {
        const message = (error as { response?: { data?: { message?: string } } }).response?.data
            ?.message;
        quasar.notify({
            type: "negative",
            message: message || "No se pudieron guardar las tarifas",
        });
    }
};
onMounted(load);
</script>

<template>
    <QPage class="q-pa-md page-background"
        ><div class="page-shell admin-shell">
            <QBtn no-caps flat icon="arrow_back" label="Dashboard" to="/admin" class="q-mb-sm" />
            <div class="section-kicker">Configuración</div>
            <div class="text-h5 q-mb-lg">Tarifas</div>
            <QCard class="route-form q-pa-md">
                <div class="text-subtitle1">Interurbano</div>
                <QInput
                    v-model="form.base_price"
                    label="Precio base"
                    type="number"
                    min="0"
                    outlined
                    dense
                    class="q-mt-sm"
                />
                <QInput
                    v-model="form.price_per_km"
                    label="Precio por kilómetro"
                    type="number"
                    min="0"
                    outlined
                    dense
                    class="q-mt-sm"
                />
                <div class="form-helper q-mt-sm">
                    Interurbano, 58 km: <strong>{{ intercityExample }}</strong>
                </div>
                <div class="text-subtitle1 q-mt-lg">Urbano, misma localidad</div>
                <QInput
                    v-model="form.urban_base_price"
                    label="Precio base urbano"
                    type="number"
                    min="0"
                    outlined
                    dense
                    class="q-mt-sm"
                />
                <QInput
                    v-model="form.urban_price_per_km"
                    label="Precio urbano por kilómetro"
                    type="number"
                    min="0"
                    outlined
                    dense
                    class="q-mt-sm"
                />
                <div class="form-helper q-mt-sm">
                    Urbano, 5 km: <strong>{{ urbanExample }}</strong>
                </div>
                <QInput v-model="form.currency" label="Moneda" outlined dense class="q-mt-md" />
                <div v-if="admin.pricing.value" class="form-helper q-mt-md">
                    Última actualización: {{ admin.pricing.value.updated_by || "sistema" }} ·
                    {{ new Date(admin.pricing.value.updated_at).toLocaleString("es-AR") }}
                </div>
                <QBtn
                    no-caps
                    unelevated
                    color="primary"
                    label="Guardar tarifas"
                    class="full-width q-mt-lg"
                    @click="save"
                />
            </QCard></div
    ></QPage>
</template>
