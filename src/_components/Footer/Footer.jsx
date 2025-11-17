import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";
import { MapPin, Clock, Phone } from "lucide-react";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">

                {/* GRID PRINCIPAL */}
                <div className={styles.grid}>

                    {/* BLOQUE BRAND (MOBILE: ROW, DESKTOP: COLUMN) */}
                    <div className={styles.brandBlock}>
                        <Image
                            src="/savia.jpg"
                            alt="Savia Logo"
                            width={120}
                            height={40}
                            className={styles.logo}
                        />

                        <p className={styles.brandText}>
                            Productos naturales, saludables y seleccionados con dedicación.
                        </p>
                    </div>

                    {/* NAVEGACIÓN */}
                    <div className={styles.block}>
                        <h4 className={styles.title}>Navegación</h4>
                        <ul className={styles.list}>
                            <li><Link href="/" className={styles.link}>Inicio</Link></li>
                            <li><Link href="/categorias" className={styles.link}>Categorías</Link></li>
                            <li><Link href="/ofertas" className={styles.link}>Ofertas</Link></li>
                            <li><Link href="/contacto" className={styles.link}>Contacto</Link></li>
                        </ul>
                    </div>

                    {/* CONTACTO */}
                    <div className={styles.block}>
                        <h4 className={styles.title}>Contacto</h4>

                        <div className={styles.row}>
                            <Phone className={styles.icon} />
                            <Link
                                href="https://wa.me/5493412275598"
                                target="_blank"
                                className={styles.link}
                            >
                                +54 9 341 227 5598
                            </Link>
                        </div>

                        <div className={styles.row}>
                            <MapPin className={styles.icon} />
                            <Link
                                href="https://www.google.com/maps?q=Antartida+850,+Chajarí,+Entre+Ríos"
                                target="_blank"
                                className={styles.link}
                            >
                                Antártida 850 - Chajarí, Entre Ríos
                            </Link>
                        </div>

                        <div className={styles.row}>
                            <Clock className={styles.icon} />
                            <p className={styles.link}>
                                Lun–Vie: 8:30–12:30 / 16:00–20:00 <br />
                                Sáb: 8:30–13:00
                            </p>
                        </div>
                    </div>
                </div>

                {/* LÍNEA */}
                <div className={styles.divider}></div>

                {/* COPYRIGHT */}
                <p className={styles.copy}>
                    © {new Date().getFullYear()} Savia — Almacén Natural. Todos los derechos reservados.
                </p>

                {/* CRÉDITO PERSONAL */}
                <p className={styles.credit}>
                    Creado por{" "}
                    <Link
                        href="https://wa.me/5493412275598"
                        target="_blank"
                        className={styles.creditLink}
                    >
                        Juanma Toniolo
                    </Link>
                </p>

            </div>
        </footer>
    );
}
