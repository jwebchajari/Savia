import Link from "next/link";
import styles from "./ContactSection.module.css";
import { MapPin, Clock, Phone, ChevronDown } from "lucide-react";
import { getLocalData } from "@/services/localService";

// Orden fijo para render
const diasOrdenados = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

// Map day index (0 domingo - 6 sábado) -> key
const mapDias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function safeTime(value) {
    return typeof value === "string" ? value : "";
}

function toMinutes(time) {
    // permite "" (vacío) => NaN
    if (!time || typeof time !== "string") return Number.NaN;
    const [h, m] = time.split(":").map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return Number.NaN;
    return h * 60 + m;
}

function normalizeHorarios(horarios) {
    const out = {};
    for (const d of diasOrdenados) {
        const src = horarios?.[d] || {};
        const cerrado = typeof src.cerrado === "boolean" ? src.cerrado : false;

        out[d] = {
            cerrado,
            franja1: {
                desde: safeTime(src?.franja1?.desde ?? ""),
                hasta: safeTime(src?.franja1?.hasta ?? ""),
            },
            franja2: {
                desde: safeTime(src?.franja2?.desde ?? ""),
                hasta: safeTime(src?.franja2?.hasta ?? ""),
            },
        };

        // Si está cerrado, vaciamos franjas para no confundir
        if (out[d].cerrado) {
            out[d].franja1 = { desde: "", hasta: "" };
            out[d].franja2 = { desde: "", hasta: "" };
        }
    }
    return out;
}

/**
 * NOW en Argentina, sin depender del timezone del server.
 * Devuelve: { dayKey, minutesNow }
 */
function nowArgentina() {
    const tz = "America/Argentina/Buenos_Aires";
    const now = new Date();

    // Sacamos hour/minute en ese TZ
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        weekday: "short",
    }).formatToParts(now);

    const get = (type) => parts.find((p) => p.type === type)?.value;

    const hour = Number(get("hour"));
    const minute = Number(get("minute"));
    const weekdayShort = get("weekday"); // Sun/Mon/Tue...

    // weekdayShort viene en inglés (por usar en-US), lo mapeamos a índice
    const idx =
        weekdayShort === "Sun" ? 0 :
            weekdayShort === "Mon" ? 1 :
                weekdayShort === "Tue" ? 2 :
                    weekdayShort === "Wed" ? 3 :
                        weekdayShort === "Thu" ? 4 :
                            weekdayShort === "Fri" ? 5 :
                                weekdayShort === "Sat" ? 6 : 0;

    return {
        dayKey: mapDias[idx],
        minutesNow: hour * 60 + minute,
    };
}

function buildHorarioHoy(h) {
    if (!h || h.cerrado) return "Cerrado";

    const f1 = h.franja1?.desde && h.franja1?.hasta ? `${h.franja1.desde}–${h.franja1.hasta}` : "";
    const f2 = h.franja2?.desde && h.franja2?.hasta ? `${h.franja2.desde}–${h.franja2.hasta}` : "";

    if (f1 && f2) return `${f1} / ${f2}`;
    if (f1) return f1;
    if (f2) return f2;
    return "Horario no definido";
}

function estaAbiertoAhora(h, minutesNow) {
    if (!h || h.cerrado) return false;

    const f1d = toMinutes(h.franja1?.desde);
    const f1h = toMinutes(h.franja1?.hasta);
    const f2d = toMinutes(h.franja2?.desde);
    const f2h = toMinutes(h.franja2?.hasta);

    const inRange = (a, b) =>
        Number.isFinite(a) && Number.isFinite(b) && minutesNow >= a && minutesNow <= b;

    return inRange(f1d, f1h) || inRange(f2d, f2h);
}

export default async function ContactSection() {
    // Obtener datos comerciales (tu servicio ya consume RTDB)
    // (según tu comentario: https://savia-876cf-default-rtdb.firebaseio.com/local/datosComerciales/horarios)
    const data = await getLocalData();

    const horarios = normalizeHorarios(data?.horarios);

    const whatsapp = data?.redes?.whatsapp
        ? `https://wa.me/${String(data.redes.whatsapp).replace(/\D/g, "")}`
        : "#";

    const direccion = data?.direccion || "Dirección no disponible";

    // NOW Argentina
    const { dayKey, minutesNow } = nowArgentina();
    const hHoy = horarios?.[dayKey];

    const abierto = estaAbiertoAhora(hHoy, minutesNow);
    const horarioHoy = buildHorarioHoy(hHoy);

    return (
        <section className={styles.section}>
            <div className="container">
                <h2 className={styles.title}>Estamos para ayudarte</h2>

                <div className={styles.card}>
                    {/* WhatsApp */}
                    <div className={styles.row}>
                        <div className={styles.iconWrapper}>
                            <Phone className={styles.icon} />
                        </div>

                        <div>
                            <p className={styles.label}>WhatsApp</p>

                            <Link href={whatsapp} target="_blank" className={styles.link}>
                                {data?.redes?.whatsapp || "No disponible"}
                            </Link>
                        </div>
                    </div>

                    {/* Ubicación */}
                    <div className={styles.row}>
                        <div className={styles.iconWrapper}>
                            <MapPin className={styles.icon} />
                        </div>

                        <div>
                            <p className={styles.label}>Ubicación</p>

                            <Link
                                href={`https://www.google.com/maps?q=${encodeURIComponent(direccion)}`}
                                target="_blank"
                                className={styles.link}
                            >
                                {direccion}
                            </Link>
                        </div>
                    </div>

                    {/* Horarios */}
                    <div className={styles.row}>
                        <div className={styles.iconWrapper}>
                            <Clock className={styles.icon} />
                        </div>

                        <div>
                            <p className={styles.label}>Horario de hoy</p>

                            <p className={`${styles.openStatus} ${abierto ? styles.open : styles.closed}`}>
                                {abierto ? "🟢 Abierto ahora" : "🔴 Cerrado ahora"}
                            </p>

                            <p className={styles.schedule}>{horarioHoy}</p>

                            {/* Acordeón */}
                            <details className={styles.accordion}>
                                <summary className={styles.accHeader}>
                                    Ver todos los horarios
                                    <ChevronDown className={styles.accIcon} />
                                </summary>

                                <div className={styles.scheduleList}>
                                    {diasOrdenados.map((dia) => {
                                        const h = horarios?.[dia];

                                        return (
                                            <div key={dia} className={styles.scheduleItem}>
                                                <span className={styles.day}>{dia}</span>

                                                {h?.cerrado ? (
                                                    <span className={styles.closedTag}>Cerrado</span>
                                                ) : (
                                                    <span className={styles.hours}>{buildHorarioHoy(h)}</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </details>
                        </div>
                    </div>

                    {/* Botón principal */}
                    <Link href={whatsapp} target="_blank" className={styles.btn}>
                        Contactar por WhatsApp
                    </Link>
                </div>
            </div>
        </section>
    );
}
