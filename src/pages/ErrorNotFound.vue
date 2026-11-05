<script setup lang="ts">
import { QBtn, QCard, QPage } from "quasar";
</script>

<template>
    <QPage class="page-background flex flex-center q-pa-md">
        <QCard class="trip-card q-pa-xl text-center error-card">
            <div class="section-kicker">VAMO!</div>
            <div class="text-h2 q-mt-sm">404</div>
            <div class="text-h6 q-mt-sm">No encontramos esta página</div>
            <div class="trip-card__meta q-mt-sm">El enlace puede haber cambiado o ya no existe.</div>
            <QBtn no-caps color="primary" label="Volver a Inicio" to="/" class="q-mt-lg" />
        </QCard>
    </QPage>
</template>

<style scoped>
.error-card { max-width: 420px; width: 100%; }
</style>
