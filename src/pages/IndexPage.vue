<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { QBtn, QCard, QCardActions, QCardSection, QIcon, QPage } from "quasar";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { useLocations } from "../composables/useLocations";
import { useRideRequests } from "../composables/useRideRequests";
import type { RideRequestRecent } from "../types/rideRequests";

const auth = useAuth();
const locations = useLocations();
const requests = useRideRequests();
const router = useRouter();
const recent = ref<RideRequestRecent[]>([]);
const currentPlace = ref("Ubicación actual");

const greeting = computed(() =>
    auth.currentUser.value?.first_name ? `Hola, ${auth.currentUser.value.first_name}` : "Hola",
);

const shortcuts = [
    { icon: "near_me", label: "Viaje", to: "/ride-requests/new" },
    { icon: "event", label: "Reservar", to: "/ride-requests/new?schedule=1" },
    { icon: "travel_explore", label: "Buscar", to: "/trips/search" },
    { icon: "add_road", label: "Publicar", to: "/trips/publish" },
];

const resolvePlace = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const locality = await locations.nearest(
                    position.coords.latitude,
                    position.coords.longitude,
                );
                currentPlace.value = locality.name;
            } catch {
                currentPlace.value = "Ubicación actual";
            }
        },
        () => undefined,
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
};

onMounted(async () => {
    await auth.bootstrap();
    if (!auth.isAuthenticated.value) return;
    resolvePlace();
    try {
        recent.value = (await requests.recent()).slice(0, 3);
    } catch {
        recent.value = [];
    }
});

const goToRequest = (item?: RideRequestRecent) =>
    router.push(
        item
            ? {
                  path: "/ride-requests/new",
                  query: {
                      destination_locality_id: item.destination_locality_id,
                      destination_name: item.destination_name,
                      destination_address: item.destination_address,
                      destination_lat: item.destination_lat,
                      destination_lon: item.destination_lon,
                  },
              }
            : "/ride-requests/new",
    );
</script>

<template>
    <QPage class="page-background q-pa-md">
        <div v-if="auth.isAuthenticated.value" class="page-shell home">
            <div class="home__top">
                <span class="home__place">
                    <span class="home__place-dot" />
                    {{ currentPlace }}
                </span>
                <span class="home__greeting">{{ greeting }}</span>
            </div>

            <div class="home__search">
                <button type="button" class="home__search-main" @click="goToRequest()">
                    <QIcon name="search" size="22px" />
                    <span>¿A dónde vas?</span>
                </button>
                <button
                    type="button"
                    class="home__search-later"
                    @click="router.push('/ride-requests/new?schedule=1')"
                >
                    <QIcon name="event" size="18px" />
                    <span>Más tarde</span>
                </button>
            </div>

            <div v-if="recent.length" class="home__recents">
                <button
                    v-for="item in recent"
                    :key="`${item.destination_locality_id}-${item.destination_address}`"
                    type="button"
                    class="home__recent"
                    @click="goToRequest(item)"
                >
                    <span class="home__recent-icon"><QIcon name="history" size="20px" /></span>
                    <span class="home__recent-text">
                        <strong>{{ item.destination_address || item.destination_name }}</strong>
                        <small>{{ item.destination_name }}</small>
                    </span>
                    <QIcon name="chevron_right" size="20px" color="grey-6" />
                </button>
            </div>

            <div class="home__section">
                <span>Para vos</span>
                <QIcon name="chevron_right" size="18px" />
            </div>
            <div class="home__shortcuts">
                <button
                    v-for="item in shortcuts"
                    :key="item.label"
                    type="button"
                    class="home__shortcut"
                    @click="router.push(item.to)"
                >
                    <span class="home__shortcut-circle"
                        ><QIcon :name="item.icon" size="26px"
                    /></span>
                    <span class="home__shortcut-label">{{ item.label }}</span>
                </button>
            </div>

            <div class="home__promo">
                <div class="home__promo-art"><QIcon name="directions_car" size="42px" /></div>
                <div class="home__promo-body">
                    <strong>VAMO! en {{ currentPlace }}</strong>
                    <small>Pedí un viaje ahora o programalo para más tarde.</small>
                </div>
            </div>

            <QBtn
                v-if="auth.currentUser.value?.roles?.includes('admin')"
                no-caps
                outline
                color="primary"
                class="full-width q-mt-md"
                icon="near_me"
                label="Pedidos cercanos"
                to="/ride-requests/available"
            />
        </div>

        <div v-else class="flex flex-center home__guest">
            <QCard class="welcome-card q-pa-sm">
                <QCardSection>
                    <div class="section-kicker">Viajá simple</div>
                    <div class="text-h4 q-mt-sm">Movete por Argentina.</div>
                    <div class="text-body1 text-grey-7 q-mt-sm">
                        Encontrá viajes, compartí asientos y llegá a destino.
                    </div>
                </QCardSection>
                <QCardActions vertical class="q-pa-md">
                    <QBtn no-caps unelevated color="primary" label="Iniciar sesión" to="/login" />
                    <QBtn no-caps flat color="primary" label="Crear cuenta" to="/register" />
                </QCardActions>
            </QCard>
        </div>
    </QPage>
</template>

<style scoped>
.home {
    padding-bottom: 32px;
}
.home__guest {
    min-height: calc(100vh - 140px);
}
.home__top {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: 14px;
}
.home__place {
    align-items: center;
    display: flex;
    font-weight: 600;
    gap: 8px;
}
.home__place-dot {
    background: var(--vamo-blue);
    border-radius: 50%;
    height: 10px;
    width: 10px;
}
.home__greeting {
    color: var(--vamo-muted);
    font-size: 0.86rem;
}
.home__search {
    align-items: center;
    background: #fff;
    border: 1px solid var(--vamo-border);
    border-radius: 999px;
    box-shadow: 0 6px 18px rgb(31 30 29 / 6%);
    display: flex;
    gap: 6px;
    padding: 6px 6px 6px 18px;
}
.home__search-main {
    align-items: center;
    background: transparent;
    border: 0;
    color: var(--vamo-placeholder);
    cursor: pointer;
    display: flex;
    flex: 1;
    font-family: inherit;
    font-size: 1rem;
    gap: 12px;
    min-height: 48px;
    min-width: 0;
    padding: 0;
    text-align: left;
}
.home__search-later {
    align-items: center;
    background: var(--vamo-paper);
    border: 0;
    border-radius: 999px;
    color: var(--vamo-ink);
    cursor: pointer;
    display: flex;
    flex-shrink: 0;
    font-family: inherit;
    font-size: 0.88rem;
    font-weight: 600;
    gap: 6px;
    min-height: 44px;
    padding: 0 16px;
}
.home__recents {
    background: #fff;
    border: 1px solid var(--vamo-border);
    border-radius: 18px;
    margin-top: 14px;
    overflow: hidden;
}
.home__recent {
    align-items: center;
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--vamo-border);
    color: var(--vamo-ink);
    cursor: pointer;
    display: flex;
    gap: 14px;
    padding: 14px 16px;
    text-align: left;
    width: 100%;
}
.home__recent:last-child {
    border-bottom: 0;
}
.home__recent-icon {
    align-items: center;
    background: #eee9e0;
    border-radius: 12px;
    color: var(--vamo-muted);
    display: flex;
    flex-shrink: 0;
    height: 42px;
    justify-content: center;
    width: 42px;
}
.home__recent-text {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
}
.home__recent-text strong {
    font-size: 0.98rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.home__recent-text small {
    color: var(--vamo-muted);
    font-size: 0.82rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.home__section {
    align-items: center;
    display: flex;
    font-family: "Space Grotesk", sans-serif;
    font-size: 1.1rem;
    font-weight: 600;
    gap: 4px;
    margin: 22px 0 12px;
}
.home__shortcuts {
    display: flex;
    gap: 14px;
    overflow-x: auto;
    padding-bottom: 4px;
}
.home__shortcut {
    align-items: center;
    background: transparent;
    border: 0;
    color: var(--vamo-ink);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0;
    width: 76px;
}
.home__shortcut-circle {
    align-items: center;
    background: #fff;
    border: 1px solid var(--vamo-border);
    border-radius: 50%;
    color: var(--vamo-blue);
    display: flex;
    height: 72px;
    justify-content: center;
    width: 72px;
}
.home__shortcut-label {
    font-size: 0.84rem;
    font-weight: 600;
}
.home__promo {
    align-items: center;
    background: #fff;
    border: 1px solid var(--vamo-border);
    border-radius: 18px;
    display: flex;
    gap: 14px;
    margin-top: 22px;
    padding: 16px;
}
.home__promo-art {
    align-items: center;
    background: var(--vamo-terra-soft);
    border-radius: 14px;
    color: var(--vamo-blue);
    display: flex;
    flex-shrink: 0;
    height: 64px;
    justify-content: center;
    width: 72px;
}
.home__promo-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}
.home__promo-body small {
    color: var(--vamo-muted);
    font-size: 0.84rem;
}
</style>
