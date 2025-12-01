"use client";

import Image from "next/image";
import styles from "./Navbar.module.css"; // Reutilizamos los estilos si querés
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function NavbarRoot() {
    const { logout } = useAuth();

    return (
        <nav className={`navbar fixed-top bg-white ${styles.navbarShadow}`}>
            <div className="container d-flex justify-content-between align-items-center">

                {/* Logo */}
                <Link href="/root/productos" className="d-flex align-items-center">
                    <Image
                        src="/savia.jpg"
                        alt="Savia Logo"
                        width={120}
                        height={40}
                        priority
                    />
                </Link>

                {/* Botón Logout */}
                <button
                    className="btn btn-outline-danger"
                    onClick={logout}
                >
                    Cerrar sesión
                </button>

            </div>
        </nav>
    );
}