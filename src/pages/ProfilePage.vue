<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { QBtn, QCard, QIcon, QInput, QPage, useQuasar } from "quasar";
import { api } from "../boot/api";
import { useAuth } from "../composables/useAuth";
import { useCompanies } from "../composables/useCompanies";
import { useDrivers } from "../composables/useDrivers";
import type { UserProfile } from "../types/auth";
import { labelFor } from "../utils/labels";

const auth = useAuth();
const companies = useCompanies();
const drivers = useDrivers();
const quasar = useQuasar();
const loading = ref(false);
const profile = ref<UserProfile | null>(null);
const form = reactive({ first_name: "", last_name: "", phone: "" });
const displayName = computed(
    () =>
        [form.first_name, form.last_name].filter(Boolean).join(" ") ||
        auth.currentUser.value?.email ||
        "Usuario",
);
const initials = computed(() =>
    displayName.value
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
);
const statusClass = (value?: string) =>
    value === "verified"
        ? "positive"
        : value === "pending_review"
          ? "warning"
          : value === "suspended"
            ? "negative"
            : "neutral";
const load = async () => {
    loading.value = true;
    try {
        const response = await api.get<{ data: UserProfile }>("/api/v1/users/me");
        profile.value = response.data.data;
        form.first_name = profile.value.first_name ?? "";
        form.last_name = profile.value.last_name ?? "";
        form.phone = profile.value.phone ?? "";
    } finally {
        loading.value = false;
    }
};
const save = async () => {
    try {
        const response = await api.patch<{ data: UserProfile }>("/api/v1/users/me", form);
        profile.value = response.data.data;
        quasar.notify({ type: "positive", message: "Perfil actualizado" });
    } catch {
        quasar.notify({ type: "negative", message: "No se pudo actualizar el perfil" });
    }
};
onMounted(async () => {
    await Promise.all([load(), companies.loadMine(), drivers.load().catch(() => null)]);
});
</script>

<template>
    <QPage class="q-pa-md page-background">
        <div class="page-shell profile-page">
            <div class="profile-page__head">
                <QBtn flat round dense icon="arrow_back" to="/" aria-label="Volver al inicio" />
                <div class="section-kicker">Cuenta</div>
            </div>
            <div class="profile-page__identity">
                <div class="profile-page__avatar">{{ initials }}</div>
                <div>
                    <div class="text-h5">{{ displayName }}</div>
                    <div class="form-helper profile-page__email">
                        {{ auth.currentUser.value?.email }}
                    </div>
                </div>
            </div>
            <QCard class="route-form q-pa-md q-mt-lg"
                ><div class="text-subtitle1 q-mb-sm">Datos personales</div>
                <QInput v-model="form.first_name" label="Nombre" outlined dense /><QInput
                    v-model="form.last_name"
                    label="Apellido"
                    outlined
                    dense
                    class="q-mt-sm" /><QInput
                    v-model="form.phone"
                    label="Teléfono"
                    outlined
                    dense
                    class="q-mt-sm" />
                <div class="form-helper q-mt-md">
                    Residencia:
                    <strong
                        >{{ profile?.locality_name ?? "No informada"
                        }}<span v-if="profile?.province_name"
                            >, {{ profile.province_name }}</span
                        ></strong
                    >
                </div>
                <QBtn
                    no-caps
                    color="primary"
                    label="Guardar cambios"
                    :loading="loading"
                    class="q-mt-md full-width"
                    @click="save"
            /></QCard>
            <QCard class="trip-card q-mt-md profile-page__menu">
                <RouterLink to="/driver-profile" class="profile-page__row"
                    ><span class="profile-page__badge"><QIcon name="directions_car" /></span
                    ><span class="profile-page__row-copy"
                        ><strong>Mi perfil de conductor</strong
                        ><small v-if="drivers.profile.value"
                            >Estado:
                            <span
                                class="status-badge"
                                :class="`status-badge--${statusClass(drivers.profile.value.status)}`"
                                >{{ labelFor(drivers.profile.value.status) }}</span
                            ></small
                        ><small v-else>Completá datos para publicar viajes</small></span
                    ><QIcon name="chevron_right"
                /></RouterLink>
                <RouterLink to="/vehicles" class="profile-page__row"
                    ><span class="profile-page__badge"><QIcon name="directions_car_filled" /></span
                    ><span class="profile-page__row-copy"
                        ><strong>Mis vehículos</strong
                        ><small>Administrá tu flota personal</small></span
                    ><QIcon name="chevron_right"
                /></RouterLink>
                <RouterLink
                    :to="companies.currentCompany.value ? '/company' : '/company/create'"
                    class="profile-page__row"
                    ><span class="profile-page__badge"><QIcon name="business" /></span
                    ><span class="profile-page__row-copy"
                        ><strong>{{
                            companies.currentCompany.value ? "Mi empresa" : "Crear empresa"
                        }}</strong
                        ><small>{{
                            companies.currentCompany.value?.display_name ??
                            "Gestioná viajes como empresa"
                        }}</small></span
                    ><QIcon name="chevron_right"
                /></RouterLink>
                <button type="button" class="profile-page__row" @click="auth.logout">
                    <span class="profile-page__badge"><QIcon name="logout" /></span
                    ><span class="profile-page__row-copy"
                        ><strong>Cerrar sesión</strong
                        ><small>Salir de tu cuenta en este dispositivo</small></span
                    ><QIcon name="chevron_right" />
                </button>
            </QCard>
        </div>
    </QPage>
</template>

<style scoped>
.profile-page__head {
    align-items: center;
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
}
.profile-page__identity {
    align-items: center;
    display: flex;
    gap: 14px;
    min-width: 0;
}
.profile-page__avatar,
.profile-page__badge {
    align-items: center;
    display: flex;
    flex-shrink: 0;
    justify-content: center;
}
.profile-page__avatar {
    background: var(--vamo-blue-dark);
    border-radius: 50%;
    color: #fff;
    font-family: "Space Grotesk", sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    height: 58px;
    width: 58px;
}
.profile-page__email {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.profile-page__row {
    align-items: center;
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--vamo-border);
    color: var(--vamo-ink);
    display: flex;
    gap: 12px;
    min-height: 72px;
    padding: 12px 14px;
    text-align: left;
    text-decoration: none;
    width: 100%;
}
.profile-page__row:last-child {
    border-bottom: 0;
}
.profile-page__badge {
    background: var(--vamo-terra-soft);
    border-radius: 50%;
    color: var(--vamo-blue);
    height: 40px;
    width: 40px;
}
.profile-page__row-copy {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
}
.profile-page__row-copy strong,
.profile-page__row-copy small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.profile-page__row-copy small {
    color: var(--vamo-muted);
    font-size: 0.8rem;
}
</style>
