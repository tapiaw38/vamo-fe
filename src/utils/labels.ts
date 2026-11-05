const labels: Record<string, string> = {
    draft: "Borrador", published: "Publicado", full: "Completo", departed: "En curso",
    completed: "Finalizado", cancelled: "Cancelado", pending: "Pendiente",
    confirmed: "Confirmada", rejected: "Rechazada", expired: "Expirada",
    pending_review: "En revisión", verified: "Verificado", suspended: "Suspendido",
    open: "Abierto", accepted: "Aceptado", active: "Activo", inactive: "Inactivo",
    automatic: "Automática", manual: "Manual", car: "Auto", motorcycle: "Moto",
    van: "Camioneta", bus: "Colectivo", driver: "Conductor", passenger: "Pasajero",
    owner: "Titular", admin: "Administrador", dispatcher: "Coordinador",
};

export const labelFor = (value?: string | null) => value ? labels[value] ?? value : "—";

export const vehicleTypeOptions = [
    { label: "Auto", value: "car" },
    { label: "Moto", value: "motorcycle" },
    { label: "Camioneta", value: "van" },
    { label: "Colectivo", value: "bus" },
];
