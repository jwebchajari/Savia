"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SubNavbar.module.css";

export default function SubNavbar() {
    const pathname = usePathname();

    const links = [
        { label: "Crear Producto", href: "/root/productos/nuevo" },
        { label: "Listar Productos", href: "/root/productos/todos-los-productos" },
        { label: "Editar Datos", href: "/root/datos" },

    ];

    return (
        <nav className={styles.subnav}>
            <div className={styles.scroller}>
                {links.map((item) => {
                    const active = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.link} ${active ? styles.active : ""}`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
