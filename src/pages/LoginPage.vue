<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { QBtn, QCard, QCardSection, QInput, QPage, useQuasar } from "quasar";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const quasar = useQuasar();
const auth = useAuth();
const email = ref("");
const password = ref("");
const submit = async () => {
    try {
        await auth.login({ email: email.value, password: password.value });
        await router.push("/");
    } catch {
        quasar.notify({ type: "negative", message: "No se pudo iniciar sesión" });
    }
};
</script>

<template>
    <QPage class="row justify-center page-background auth-page">
        <QCard class="auth-card">
            <QCardSection>
                <div class="section-kicker">VAMO!</div>
                <div class="text-h5 q-mt-xs">Iniciar sesión</div>
                <div class="text-body2 text-grey-7 q-mb-md">Encontrá tu próximo viaje.</div>
                <QInput v-model="email" label="Correo" type="email" outlined /><QInput
                    v-model="password"
                    class="q-mt-sm"
                    label="Contraseña"
                    type="password"
                    outlined
                /><QBtn
                    class="q-mt-md full-width"
                    color="primary"
                    label="Iniciar sesión"
                    :loading="auth.loading.value"
                    @click="submit"
                />
                <QBtn flat no-caps color="primary" label="Crear cuenta" to="/register" class="full-width q-mt-sm" />
            </QCardSection>
        </QCard>
    </QPage>
</template>
