import { defineStore } from "pinia";
import { ref } from "vue";
import { bookingsService } from "../services/bookings/bookingsService";
import type { Booking } from "../types/bookings";
export const useBookingsStore = defineStore("bookings", () => {
    const items = ref<Booking[]>([]);
    const received = ref<Booking[]>([]);
    const loading = ref(false);
    const mine = async (status?: string) => {
        loading.value = true;
        try {
            items.value = await bookingsService.mine(status);
        } finally {
            loading.value = false;
        }
    };
    const loadReceived = async (status?: string) => {
        loading.value = true;
        try {
            received.value = await bookingsService.received(status);
        } finally {
            loading.value = false;
        }
    };
    const create = async (tripID: string, seats: number) => {
        loading.value = true;
        try {
            return await bookingsService.create(tripID, seats);
        } finally {
            loading.value = false;
        }
    };
    const cancel = async (id: string) => {
        const item = await bookingsService.cancel(id);
        items.value = items.value.map((current) => (current.id === id ? item : current));
        received.value = received.value.map((current) => (current.id === id ? item : current));
        return item;
    };
    const confirm = async (id: string) => {
        const item = await bookingsService.confirm(id);
        received.value = received.value.map((current) => (current.id === id ? item : current));
        return item;
    };
    const reject = async (id: string) => {
        const item = await bookingsService.reject(id);
        received.value = received.value.map((current) => (current.id === id ? item : current));
        return item;
    };
    const rate = async (id: string, score: number, comment?: string) => {
        return await bookingsService.rate(id, score, comment);
    };
    return { items, received, loading, mine, loadReceived, create, cancel, confirm, reject, rate };
});
