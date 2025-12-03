import Link from "next/link";
import styles from "./ContactSection.module.css";
import { MapPin, Clock, Phone, ChevronDown } from "lucide-react";
import { getLocalData } from "@/services/localService";

export default async function ContactSection() {

    // Obtener datos comerciales desde RTDB
    const data = await getLocalData();

    const whatsapp = data.redes.whatsapp
        ? `https://wa.me/${data.redes.whatsapp.replace(/\D/g, "")}`
        : "#";

    const direccion = data.direccion || "Dirección no disponible";

    const diasOrdenados = [
        "lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"
    ];

    // Normalizar hora → minutos
    const toMinutes = (time) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    };

    // -----------------------------
    // 📌 Estado del local HOY
    // -----------------------------
    const obtenerEstado = () => {
        const ahora = new Date();
        const dayIndex = ahora.getDay(); // 0 Domingo → 6 Sábado

        const mapDias = [
            "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"
        ];

        const hoy = mapDias[dayIndex];
        const h = data.horarios[hoy];

        if (!h || h.cerrado)
            return { abierto: false, horarioHoy: "Cerrado" };

        const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();

        const enFranja =
            (ahoraMin >= toMinutes(h.franja1.desde) && ahoraMin <= toMinutes(h.franja1.hasta)) ||
            (ahoraMin >= toMinutes(h.franja2.desde) && ahoraMin <= toMinutes(h.franja2.hasta));

        return {
            abierto: enFranja,
            horarioHoy: `${h.franja1.desde}–${h.franja1.hasta} / ${h.franja2.desde}–${h.franja2.hasta}`
        };
    };

    const { abierto, horarioHoy } = obtenerEstado();

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
                                {data.redes.whatsapp || "No disponible"}
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
                                        const h = data.horarios[dia];

                                        return (
                                            <div key={dia} className={styles.scheduleItem}>
                                                <span className={styles.day}>{dia}</span>

                                                {h.cerrado ? (
                                                    <span className={styles.closedTag}>Cerrado</span>
                                                ) : (
                                                    <span className={styles.hours}>
                                                        {h.franja1.desde}–{h.franja1.hasta} /{" "}
                                                        {h.franja2.desde}–{h.franja2.hasta}
                                                    </span>
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
