import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        component: () => import("../layouts/MainLayout.vue"),
        children: [
            { path: "", component: () => import("../pages/IndexPage.vue") },
            { path: "/login", component: () => import("../pages/LoginPage.vue") },
            { path: "/register", component: () => import("../pages/RegisterPage.vue") },
            {
                path: "/profile",
                component: () => import("../pages/ProfilePage.vue"),
                meta: { requiresAuth: true },
            },
            {
                path: "/driver-profile",
                component: () => import("../pages/DriverProfilePage.vue"),
                meta: { requiresAuth: true },
            },
            {
                path: "/vehicles",
                component: () => import("../pages/VehiclesPage.vue"),
                meta: { requiresAuth: true },
            },
            { path: "/trips/search", component: () => import("../pages/TripSearchPage.vue") },
            {
                path: "/ride-requests/new",
                component: () => import("../pages/RequestRidePage.vue"),
                meta: { requiresAuth: true },
            },
            {
                path: "/ride-requests/:id/waiting",
                component: () => import("../pages/RideRequestWaitingPage.vue"),
                meta: { requiresAuth: true },
            },
            {
                path: "/ride-requests/available",
                component: () => import("../pages/AvailableRideRequestsPage.vue"),
                meta: { requiresAuth: true },
            },
            {
                path: "/trips/publish",
                component: () => import("../pages/PublishTripPage.vue"),
                meta: { requiresAuth: true },
            },
            {
                path: "/trips/mine",
                component: () => import("../pages/MyTripsPage.vue"),
                meta: { requiresAuth: true },
            },
            { path: "/trips/:id", component: () => import("../pages/TripDetailPage.vue") },
            {
                path: "/bookings/mine",
                component: () => import("../pages/MyBookingsPage.vue"),
                meta: { requiresAuth: true },
            },
            {
                path: "/bookings/received",
                component: () => import("../pages/ReceivedBookingsPage.vue"),
                meta: { requiresAuth: true },
            },
            {
                path: "/company/create",
                component: () => import("../pages/company/CreateCompanyPage.vue"),
                meta: { requiresAuth: true },
            },
            {
                path: "/company",
                component: () => import("../pages/company/CompanyDashboardPage.vue"),
                meta: { requiresAuth: true },
            },
            {
                path: "/company/members",
                component: () => import("../pages/company/CompanyMembersPage.vue"),
                meta: { requiresAuth: true },
            },
            {
                path: "/company/vehicles",
                component: () => import("../pages/company/CompanyVehiclesPage.vue"),
                meta: { requiresAuth: true },
            },
        ],
    },
    {
        path: "/admin",
        component: () => import("../layouts/AdminLayout.vue"),
        meta: { requiresAuth: true },
        children: [
            { path: "", component: () => import("../pages/admin/AdminDashboardPage.vue") },
            { path: "pricing", component: () => import("../pages/admin/AdminPricingPage.vue") },
        ],
    },
    { path: "/:catchAll(.*)*", component: () => import("../pages/ErrorNotFound.vue") },
];

export default routes;
