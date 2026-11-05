<script setup lang="ts">
import { QBtn, QHeader, QLayout, QPageContainer, QToolbar, QToolbarTitle } from "quasar";
import { useAuth } from "../composables/useAuth";
const auth = useAuth();
</script>
<template>
    <QLayout view="lHh Lpr lFf">
        <QHeader>
            <QToolbar
                ><QToolbarTitle class="brand-mark">VAMO! <span>· Administración</span></QToolbarTitle
                ><QBtn no-caps flat label="Volver a la app" to="/" /><QBtn
                    no-caps
                    flat
                    round
                    icon="logout"
                    aria-label="Cerrar sesión"
                    @click="auth.logout"
            /></QToolbar> </QHeader
        ><QPageContainer><router-view /></QPageContainer>
    </QLayout>
</template>
