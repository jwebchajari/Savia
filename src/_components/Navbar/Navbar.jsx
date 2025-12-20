"use client";

import Image from "next/image";
import styles from "./Navbar.module.css";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
    const { totalItems } = useCart();

    return (
        <nav className={`navbar fixed-top bg-white ${styles.navbarShadow}`}>
            <div className="container d-flex justify-content-between align-items-center">
                {/* Logo */}
                <Link href="/" className="d-flex align-items-center" aria-label="Ir al inicio">
                    <Image
                        src="/savia.jpg"
                        alt="Savia Logo"
                        width={120}
                        height={40}
                        priority
                    />
                </Link>

                {/* Carrito -> página */}
                <Link
                    href="/carrito"
                    className={styles.cartWrapper}
                    aria-label="Ver carrito"
                >
                    <Image
                        src="/icons/cart-fresh.svg"
                        alt="Carrito"
                        width={32}
                        height={32}
                    />

                    {totalItems > 0 && (
                        <span className={styles.cartBadge}>{totalItems}</span>
                    )}
                </Link>
            </div>
        </nav>
    );
}
