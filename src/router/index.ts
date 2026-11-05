import { route } from "quasar/wrappers";
import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";
import { useAuthStore } from "../stores/authStore";

export default route(() => {
    const router = createRouter({
        history: createWebHistory(),
        routes,
        scrollBehavior: () => ({ left: 0, top: 0 }),
    });
    let bootstrapped = false;
    router.beforeEach(async (to) => {
        const auth = useAuthStore();
        if (!bootstrapped) {
            await auth.bootstrap();
            bootstrapped = true;
        }
        if (to.meta.requiresAuth && !auth.isAuthenticated)
            return { path: "/login", query: { redirect: to.fullPath } };
        if (to.path === "/" && !auth.isAuthenticated) return { path: "/login" };
        return true;
    });
    return router;
});
