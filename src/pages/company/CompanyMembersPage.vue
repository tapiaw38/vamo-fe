<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { QBtn, QCard, QInput, QPage, QSelect, useQuasar } from "quasar";
import { useCompanies } from "../../composables/useCompanies";
import { labelFor } from "../../utils/labels";
import { usersService } from "../../services/users/usersService";
import type { UserSearchResult } from "../../types/users";

const companies = useCompanies();
const quasar = useQuasar();
const userOptions = ref<UserSearchResult[]>([]);
let searchTimer: ReturnType<typeof setTimeout> | undefined;
const form = reactive({
    user_id: "",
    role: "driver" as "owner" | "admin" | "dispatcher" | "driver",
});
onMounted(async () => {
    await companies.loadMine();
    if (companies.currentCompany.value) await companies.loadMembers();
});
const add = async () => {
    try {
        await companies.addMember(form);
        form.user_id = "";
        quasar.notify({ type: "positive", message: "Miembro agregado" });
    } catch {
        quasar.notify({ type: "negative", message: "No se pudo agregar el miembro" });
    }
};
const remove = async (id: string) => {
    try {
        await companies.removeMember(id);
        quasar.notify({ type: "positive", message: "Miembro quitado" });
    } catch {
        quasar.notify({ type: "negative", message: "No se pudo quitar el miembro" });
    }
};
const searchUsers = (value: string, update: (callback: () => void) => void) => {
    update(() => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(async () => { userOptions.value = value.trim().length >= 2 ? await usersService.search(value.trim()) : []; }, 300);
    });
};
</script>

<template>
    <QPage class="q-pa-md"
        ><div class="page-shell">
            <QBtn flat no-caps icon="arrow_back" label="Empresa" to="/company" class="q-mb-sm" />
            <div class="section-kicker">Equipo</div><div class="text-h5 q-mb-md">Miembros de la empresa</div>
            <QCard class="route-form q-pa-md q-mb-md"
                ><QSelect v-model="form.user_id" label="Buscar usuario por nombre o email" :options="userOptions" option-label="email" option-value="id" emit-value map-options use-input fill-input input-debounce="300" @filter="searchUsers"><template #option="scope"><q-item v-bind="scope.itemProps"><q-item-section><q-item-label>{{ scope.opt.first_name }} {{ scope.opt.last_name }}</q-item-label><q-item-label caption>{{ scope.opt.email }} · {{ scope.opt.id }}</q-item-label></q-item-section></q-item></template><template #selected-item="scope">{{ scope.opt.first_name }} {{ scope.opt.last_name }} · {{ scope.opt.email }}</template></QSelect><QSelect
                    v-model="form.role"
                    class="q-mt-sm"
                    label="Rol"
                    :options="[
                        { label: 'Propietario', value: 'owner' },
                        { label: 'Administrador', value: 'admin' },
                        { label: 'Despachador', value: 'dispatcher' },
                        { label: 'Conductor', value: 'driver' },
                    ]"
                    emit-value
                    map-options /><QBtn
                    class="q-mt-md full-width"
                    color="primary"
                    no-caps
                    label="Agregar miembro"
                    :loading="companies.loading.value"
                    @click="add"
            /></QCard>
            <QCard
                v-for="member in companies.members.value"
                :key="member.user_id"
                class="trip-card q-mb-sm"
                ><div class="trip-card__top">
                    <div class="text-subtitle1">{{ member.user_id }}</div>
                    <span
                        :class="[
                            'status-badge',
                            member.status === 'active'
                                ? 'status-badge--positive'
                                : 'status-badge--neutral',
                        ]"
                        >{{ labelFor(member.role) }} · {{ labelFor(member.status) }}</span
                    >
                </div>
                <div class="trip-card__ticket">
                    <QBtn
                        flat
                        no-caps
                        color="negative"
                        label="Quitar miembro"
                        @click="remove(member.user_id)"
                    /></div
            ></QCard>
            <QCard v-if="!companies.members.value.length" class="trip-card q-pa-lg text-center">
                <div class="text-h6">Todavía no hay miembros</div><div class="trip-card__meta q-mt-sm">Agregá conductores y colaboradores para operar tu empresa.</div>
            </QCard>
        </div></QPage
    >
</template>
