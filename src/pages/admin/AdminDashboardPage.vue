<script setup lang="ts">
import { onMounted, ref } from "vue";
import { QBtn, QCard, QPage, QTable, QTabs, QTab, useQuasar } from "quasar";
import { useAdmin } from "../../composables/useAdmin";
import { labelFor } from "../../utils/labels";

const admin = useAdmin();
const quasar = useQuasar();
const tab = ref("users");
const columns = [
    { name: "id", label: "ID", field: "id", align: "left" as const },
    { name: "status", label: "Estado", field: "status", align: "left" as const },
    { name: "created_at", label: "Creado", field: "created_at", align: "left" as const },
];
onMounted(() => {
    admin.loadDashboard();
    admin.load(tab.value);
});
const changeTab = () => admin.load(tab.value);
const verify = async (row: Record<string, unknown>, kind: string) => {
    try {
        await admin.verify(kind, String(row.id), "verified");
        quasar.notify({ type: "positive", message: "Verificación aplicada" });
        await admin.load(tab.value);
    } catch {
        quasar.notify({ type: "negative", message: "No se pudo verificar" });
    }
};
const statusClass = (value: string) =>
    value === "verified" || value === "published" || value === "confirmed"
        ? "positive"
        : value === "pending_review" || value === "pending"
          ? "warning"
          : value === "suspended" || value === "cancelled" || value === "rejected"
            ? "negative"
            : "neutral";
</script>

<template>
    <QPage class="q-pa-md page-background"
        ><div class="page-shell admin-shell">
            <div class="row items-center justify-between q-mb-lg">
                <div>
                    <div class="section-kicker">Control VAMO!</div>
                    <div class="text-h4">Dashboard administrativo</div>
                </div>
                <QBtn
                    no-caps
                    outline
                    color="primary"
                    label="Configurar tarifas"
                    to="/admin/pricing"
                />
            </div>
            <div class="row q-col-gutter-sm q-mb-lg">
                <QCard
                    v-for="(value, key) in admin.dashboard.value"
                    :key="key"
                    class="trip-card q-pa-md col-6 col-sm-3"
                    ><div class="section-kicker">{{ key }}</div>
                    <div class="text-h5 q-mt-sm">
                        {{ typeof value === "object" ? "Detalle" : value }}
                    </div></QCard
                >
            </div>
            <QCard class="trip-card q-pa-sm">
                <QTabs
                    v-model="tab"
                    active-color="primary"
                    indicator-color="primary"
                    @update:model-value="changeTab"
                    ><QTab name="users" label="Usuarios" /><QTab
                        name="drivers"
                        label="Conductores" /><QTab name="companies" label="Empresas" /><QTab
                        name="trips"
                        label="Viajes" /><QTab name="bookings" label="Reservas"
                /></QTabs>
                <QTable
                    flat
                    class="q-mt-sm"
                    :rows="admin.rows.value"
                    :columns="columns"
                    row-key="id"
                    :loading="admin.loading.value"
                >
                    <template #body-cell-status="props"
                        ><q-td :props="props"
                            ><span
                                class="status-badge"
                                :class="`status-badge--${statusClass(String(props.value))}`"
                                >{{ labelFor(String(props.value)) }}</span
                            ><QBtn
                                v-if="tab === 'drivers' || tab === 'companies'"
                                no-caps
                                flat
                                dense
                                color="primary"
                                label="Verificar"
                                class="q-ml-sm"
                                @click="
                                    verify(props.row, tab === 'drivers' ? 'driver' : 'company')
                                " /></q-td
                    ></template>
                </QTable>
            </QCard></div
    ></QPage>
</template>
