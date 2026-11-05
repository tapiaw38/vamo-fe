<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { QBtn, QCard, QDialog, QInput, QPage, QSelect, useQuasar } from "quasar";
import { useVehicles } from "../composables/useVehicles";
import type { Vehicle } from "../types/vehicles";
import { labelFor, vehicleTypeOptions } from "../utils/labels";

const quasar = useQuasar();
const vehicles = useVehicles();
const dialog = ref(false);
const editing = ref<Vehicle | null>(null);
const photoPreview = ref("");
const photoError = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const form = reactive({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    license_plate: "",
    authorized_seats: 4,
    vehicle_type: "car",
    photo_url: "",
});
const native = Capacitor.isNativePlatform();
const hasPhoto = computed(() => Boolean(photoPreview.value));
const reset = () => {
    Object.assign(form, {
        make: "",
        model: "",
        year: new Date().getFullYear(),
        license_plate: "",
        authorized_seats: 4,
        vehicle_type: "car",
        photo_url: "",
    });
    photoPreview.value = "";
    photoError.value = "";
    editing.value = null;
};
const openCreate = () => {
    reset();
    dialog.value = true;
};
const openEdit = (item: Vehicle) => {
    editing.value = item;
    Object.assign(form, {
        make: item.make,
        model: item.model,
        year: item.year,
        license_plate: item.license_plate,
        authorized_seats: item.authorized_seats,
        vehicle_type: item.vehicle_type,
        photo_url: item.photo_url || "",
    });
    photoPreview.value = item.photo_url || "";
    photoError.value = "";
    dialog.value = true;
};
const compressImage = (source: string | Blob) =>
    new Promise<string>((resolve, reject) => {
        const image = new Image();
        const objectURL = source instanceof Blob ? URL.createObjectURL(source) : "";
        image.onload = () => {
            const largest = Math.max(image.naturalWidth, image.naturalHeight);
            const ratio = largest > 1280 ? 1280 / largest : 1;
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
            canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
            canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
            if (objectURL) URL.revokeObjectURL(objectURL);
            resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        image.onerror = () => {
            if (objectURL) URL.revokeObjectURL(objectURL);
            reject(new Error("invalid image"));
        };
        image.src = objectURL || (source as string);
    });
const applyPhoto = async (source: string | Blob) => {
    try {
        photoError.value = "";
        const dataURI = await compressImage(source);
        form.photo_url = dataURI;
        photoPreview.value = dataURI;
    } catch {
        photoError.value = "No pudimos procesar la foto. Elegí otra imagen.";
    }
};
const onFile = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) await applyPhoto(file);
    if (fileInput.value) fileInput.value.value = "";
};
const takePhoto = async (source: CameraSource) => {
    try {
        const photo = await Camera.getPhoto({
            quality: 90,
            resultType: CameraResultType.DataUrl,
            source,
            correctOrientation: true,
        });
        if (photo.dataUrl) await applyPhoto(photo.dataUrl);
    } catch {
        /* User cancelled picker; form remains available. */
    }
};
const removePhoto = () => {
    form.photo_url = "";
    photoPreview.value = "";
    photoError.value = "";
};
const hideBrokenImage = (event: Event) => {
    (event.target as HTMLImageElement).style.display = "none";
};
const save = async () => {
    try {
        const isEditing = Boolean(editing.value);
        if (editing.value) await vehicles.update(editing.value.id, { ...form });
        else await vehicles.create({ ...form });
        dialog.value = false;
        reset();
        quasar.notify({
            type: "positive",
            message: isEditing ? "Vehículo actualizado" : "Vehículo registrado",
        });
    } catch (error: unknown) {
        const message = (error as { response?: { data?: { message?: string } } }).response?.data
            ?.message;
        quasar.notify({ type: "negative", message: message || "No se pudo guardar el vehículo" });
    }
};
const statusClass = (value: string) =>
    value === "verified"
        ? "positive"
        : value === "rejected" || value === "suspended"
          ? "negative"
          : value === "pending_review"
            ? "warning"
            : "neutral";
const maskedPlate = (plate: string) =>
    plate.length <= 3
        ? "***"
        : `${plate.slice(0, Math.min(3, plate.length - 2))}${"*".repeat(Math.max(2, plate.length - 5))}${plate.slice(-2)}`;
onMounted(() => vehicles.load());
</script>

<template>
    <QPage class="q-pa-md page-background">
        <div class="page-shell vehicles-page">
            <div class="vehicles-page__head">
                <QBtn
                    flat
                    round
                    dense
                    icon="arrow_back"
                    to="/profile"
                    aria-label="Volver al perfil"
                />
                <div>
                    <div class="section-kicker">Flota personal</div>
                    <div class="text-h6">Mis vehículos</div>
                </div>
                <QBtn
                    no-caps
                    unelevated
                    color="primary"
                    icon="add"
                    label="Agregar"
                    class="q-ml-auto"
                    @click="openCreate"
                />
            </div>
            <QCard v-for="item in vehicles.items.value" :key="item.id" class="trip-card q-mt-md">
                <img
                    v-if="item.photo_url"
                    :src="item.photo_url"
                    :alt="`${item.make} ${item.model}`"
                    class="vehicle-photo"
                    @error="hideBrokenImage"
                />
                <div class="trip-card__top">
                    <div class="text-h6 ellipsis">{{ item.make }} {{ item.model }}</div>
                    <div class="trip-card__meta">
                        {{ item.year }} · {{ labelFor(item.vehicle_type) }}
                    </div>
                </div>
                <div class="trip-card__ticket">
                    <div class="trip-card__meta">
                        Patente {{ maskedPlate(item.license_plate) }} ·
                        {{ item.authorized_seats }} asientos
                    </div>
                    <span
                        class="status-badge q-mt-sm"
                        :class="`status-badge--${statusClass(item.verification_status)}`"
                        >{{ labelFor(item.verification_status) }}</span
                    ><QBtn
                        no-caps
                        flat
                        color="primary"
                        label="Editar vehículo"
                        class="q-mt-sm"
                        @click="openEdit(item)"
                    />
                </div>
            </QCard>
            <QCard
                v-if="!vehicles.items.value.length"
                class="trip-card empty-state q-pa-lg text-center"
                ><div class="text-h6">Todavía no tenés vehículos registrados</div>
                <div class="form-helper q-mt-sm">
                    Agregá un vehículo para poder publicar viajes.
                </div>
                <QBtn
                    no-caps
                    color="primary"
                    label="Agregar vehículo"
                    class="q-mt-md"
                    @click="openCreate"
            /></QCard>
            <QDialog v-model="dialog"
                ><QCard class="q-pa-md vehicles-page__dialog"
                    ><div class="text-h6">
                        {{ editing ? "Editar vehículo" : "Agregar vehículo" }}
                    </div>
                    <div class="row q-col-gutter-sm q-mt-sm">
                        <QInput
                            v-model="form.make"
                            class="col-6"
                            label="Marca"
                            outlined
                            dense
                        /><QInput
                            v-model="form.model"
                            class="col-6"
                            label="Modelo"
                            outlined
                            dense
                        /><QInput
                            v-model.number="form.year"
                            class="col-6"
                            label="Año"
                            type="number"
                            outlined
                            dense
                        /><QInput
                            v-model="form.license_plate"
                            class="col-6"
                            label="Patente"
                            outlined
                            dense
                        /><QInput
                            v-model.number="form.authorized_seats"
                            class="col-6"
                            label="Asientos habilitados"
                            type="number"
                            outlined
                            dense
                        /><QSelect
                            v-model="form.vehicle_type"
                            class="col-6"
                            label="Tipo"
                            :options="vehicleTypeOptions"
                            emit-value
                            map-options
                            outlined
                            dense
                        />
                    </div>
                    <div class="vehicles-page__photo-picker q-mt-md">
                        <div class="text-subtitle2">
                            Foto del vehículo <span class="form-helper">(opcional)</span>
                        </div>
                        <img
                            v-if="hasPhoto"
                            :src="photoPreview"
                            alt="Vista previa del vehículo"
                            class="vehicles-page__preview q-mt-sm"
                            @error="photoError = 'No pudimos mostrar esta foto.'"
                        />
                        <div v-else class="vehicles-page__photo-empty q-mt-sm">
                            <QBtn
                                no-caps
                                flat
                                color="primary"
                                icon="photo_library"
                                label="Elegir foto"
                                @click="
                                    native ? takePhoto(CameraSource.Photos) : fileInput?.click()
                                "
                            /><QBtn
                                v-if="native"
                                no-caps
                                flat
                                color="primary"
                                icon="photo_camera"
                                label="Usar cámara"
                                @click="takePhoto(CameraSource.Camera)"
                            />
                        </div>
                        <input
                            ref="fileInput"
                            class="vehicles-page__file"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            capture="environment"
                            @change="onFile"
                        />
                        <div v-if="hasPhoto" class="row q-gutter-sm q-mt-sm">
                            <QBtn
                                v-if="native"
                                no-caps
                                flat
                                color="primary"
                                icon="photo_library"
                                label="Cambiar foto"
                                @click="takePhoto(CameraSource.Photos)"
                            /><QBtn
                                v-else
                                no-caps
                                flat
                                color="primary"
                                icon="photo_library"
                                label="Cambiar foto"
                                @click="fileInput?.click()"
                            /><QBtn
                                no-caps
                                flat
                                color="negative"
                                label="Quitar foto"
                                @click="removePhoto"
                            />
                        </div>
                        <div v-if="photoError" class="form-helper text-negative q-mt-sm">
                            {{ photoError }}
                        </div>
                    </div>
                    <div class="row justify-end q-gutter-sm q-mt-md">
                        <QBtn no-caps flat label="Cancelar" @click="dialog = false" /><QBtn
                            no-caps
                            color="primary"
                            :label="editing ? 'Guardar vehículo' : 'Registrar vehículo'"
                            :loading="vehicles.loading.value"
                            @click="save"
                        /></div></QCard
            ></QDialog>
        </div>
    </QPage>
</template>

<style scoped>
.vehicles-page__head {
    align-items: center;
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
}
.vehicles-page__dialog {
    width: min(94vw, 480px);
}
.vehicles-page__photo-picker {
    background: var(--vamo-paper);
    border: 1px solid var(--vamo-border);
    border-radius: 14px;
    padding: 12px;
}
.vehicles-page__photo-empty {
    align-items: center;
    border: 1px dashed var(--vamo-border-strong);
    border-radius: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    min-height: 74px;
    padding: 8px;
}
.vehicles-page__preview {
    display: block;
    height: 180px;
    object-fit: cover;
    width: 100%;
}
.vehicles-page__file {
    display: none;
}
</style>
