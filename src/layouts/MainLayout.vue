<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
    QBtn,
    QFooter,
    QHeader,
    QLayout,
    QPageContainer,
    QRouteTab,
    QTabs,
    QToolbar,
    QToolbarTitle,
} from "quasar";
import { useAuth } from "../composables/useAuth";

const auth = useAuth();
const route = useRoute();
const isAuthPage = computed(() => route.path === "/login" || route.path === "/register");
const showHeaderAuthActions = computed(
    () => !isAuthPage.value && !auth.isAuthenticated.value,
);
onMounted(() => auth.bootstrap());
</script>

<template>
    <QLayout view="lHh Lpr lFf">
        <QHeader>
            <QToolbar>
                <QToolbarTitle class="brand-mark">VAMO<span>!</span></QToolbarTitle>
                <QBtn
                    v-if="auth.isAuthenticated.value && !isAuthPage"
                    no-caps
                    flat
                    round
                    icon="logout"
                    aria-label="Cerrar sesión"
                    @click="auth.logout"
                />
                <div v-if="showHeaderAuthActions" class="row q-gutter-xs">
                    <QBtn no-caps flat label="Iniciar sesión" to="/login" />
                    <QBtn no-caps flat label="Crear cuenta" to="/register" />
                </div>
            </QToolbar>
        </QHeader>
        <QPageContainer><router-view /></QPageContainer>
        <QFooter
            v-if="auth.isAuthenticated.value && !isAuthPage"
            class="floating-bottom-nav"
        >
            <QTabs
                align="justify"
                active-color="primary"
                indicator-color="transparent"
                class="mobile-nav"
            >
                <QRouteTab icon="home" label="Inicio" to="/" exact />
                <QRouteTab icon="search" label="Buscar" to="/trips/search" />
                <QRouteTab icon="directions_car" label="Mis viajes" to="/trips/mine" />
                <QRouteTab icon="person" label="Perfil" to="/profile" />
            </QTabs>
        </QFooter>
    </QLayout>
</template>
