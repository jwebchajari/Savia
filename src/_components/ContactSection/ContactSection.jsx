import Link from "next/link";
import styles from "./ContactSection.module.css";
import { MapPin, Clock, Phone } from "lucide-react";

export default function ContactSection() {
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
                            <Link
                                href="https://wa.me/5493412275598"
                                target="_blank"
                                className={styles.link}
                            >
                                +54 9 341 227 5598
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
                                href="https://www.google.com/maps?q=Antartida+850,+Chajarí,+Entre+Ríos"
                                target="_blank"
                                className={styles.link}
                            >
                                Antártida 850 - Chajarí, Entre Ríos
                            </Link>
                        </div>
                    </div>

                    {/* Horarios */}
                    <div className={styles.row}>
                        <div className={styles.iconWrapper}>
                            <Clock className={styles.icon} />
                        </div>

                        <div>
                            <p className={styles.label}>Horarios de atención</p>
                            <p className={styles.schedule}>
                                Lunes a Viernes: 8:30 a 12:30 / 16:00 a 20:00 <br />
                                Sábados: 8:30 a 13:00
                            </p>
                        </div>
                    </div>

                    {/* Botón */}
                    <Link
                        href="https://wa.me/5493412275598"
                        target="_blank"
                        className={styles.btn}
                    >
                        Contactar por WhatsApp
                    </Link>

                </div>
            </div>
        </section>
    );
}
