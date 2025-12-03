import { rtdb } from "@/firebase/firebase";
import { ref, get, update } from "firebase/database";

const LOCAL_PATH = "local/datosComerciales";

const DIAS = [
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
    "domingo",
];

// Normaliza horarios para evitar undefined
const normalizeHorarios = (data) => {
    const horarios = {};
    DIAS.forEach((dia) => {
        horarios[dia] = {
            cerrado: data?.horarios?.[dia]?.cerrado ?? false,
            franja1: data?.horarios?.[dia]?.franja1 ?? {
                desde: "08:00",
                hasta: "12:00",
            },
            franja2: data?.horarios?.[dia]?.franja2 ?? {
                desde: "16:00",
                hasta: "20:00",
            },
        };
    });
    return horarios;
};

// ✔ GET
export const getLocalData = async () => {
    const snap = await get(ref(rtdb, LOCAL_PATH));

    const data = snap.exists() ? snap.val() : {};

    return {
        direccion: data.direccion ?? "",
        delivery: data.delivery ?? 0,

        redes: {
            instagram: data.redes?.instagram ?? "",
            whatsapp: data.redes?.whatsapp ?? "",
            facebook: data.redes?.facebook ?? "",
            telegram: data.redes?.telegram ?? "",
            email: data.redes?.email ?? "",
        },

        horarios: normalizeHorarios(data),
    };
};

// ✔ UPDATE
export const updateLocalData = async (form) => {
    await update(ref(rtdb, LOCAL_PATH), form);
};
