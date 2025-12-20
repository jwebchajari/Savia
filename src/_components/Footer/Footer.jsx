"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";
import { MapPin, Clock, Phone } from "lucide-react";

export default function Footer() {
    const [year, setYear] = useState("");

    // ✅ Evita error de hydration
    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    return (
        <footer className={styles.footer}>
            <div className="container">

                {/* GRID PRINCIPAL */}
                <div className={styles.grid}>

                    {/* BRAND */}
                    <div className={styles.brandBlock}>
                        <Image
                            src="/savia.jpg"
                            alt="Savia – Almacén Natural"
                            width={120}
                            height={40}
                            className={styles.logo}
                            priority
                        />

                        <p className={styles.brandText}>
                            Productos naturales, saludables y seleccionados con dedicación.
                        </p>
                    </div>

                    {/* NAVEGACIÓN */}
                    <div className={styles.block}>
                        <h4 className={styles.title}>Navegación</h4>
                        <ul className={styles.list}>
                            <li>
                                <Link href="/" className={styles.link}>
                                    Inicio
                                </Link>
                            </li>
                            <li>
                                <Link href="/categorias" className={styles.link}>
                                    Categorías
                                </Link>
                            </li>
                            <li>
                                <Link href="/ofertas" className={styles.link}>
                                    Ofertas
                                </Link>
                            </li>
                            <li>
                                <Link href="/contacto" className={styles.link}>
                                    Contacto
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* CONTACTO */}
                    <div className={styles.block}>
                        <h4 className={styles.title}>Contacto</h4>

                        <div className={styles.row}>
                            <Phone className={styles.icon} />
                            <Link
                                href="https://wa.me/5493456020167"
                                target="_blank"
                                className={styles.link}
                            >
                                +54 9 3456 02-0167
                            </Link>
                        </div>

                        <div className={styles.row}>
                            <MapPin className={styles.icon} />
                            <Link
                                href="https://www.google.com/maps?q=Av.+Belgrano+2011,+Chajarí,+Entre+Ríos"
                                target="_blank"
                                className={styles.link}
                            >
                                Av. Belgrano 2011 – Chajarí, Entre Ríos
                            </Link>
                        </div>

                        <div className={styles.row}>
                            <Clock className={styles.icon} />
                            <p className={styles.link}>
                                Lun a sáb 7:30 a 12:45 <br />
                                15:30 a 21:00
                            </p>
                        </div>
                    </div>
                </div>

                {/* DIVISOR */}
                <div className={styles.divider} />

                {/* COPYRIGHT */}
                <p className={styles.copy}>
                    © {year} Savia — Almacén Natural. Todos los derechos reservados.
                </p>

                {/* CRÉDITO */}
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
