"use client";

import Image from "next/image";
import styles from "./Navbar.module.css";
import Link from "next/link";

export default function Navbar() {
    return (
        <nav className={`navbar fixed-top bg-white ${styles.navbarShadow}`}>
            <div className="container d-flex justify-content-between align-items-center">

                {/* Logo */}
                <Link href="/" className="d-flex align-items-center">
                    <Image
                        src="/savia.jpg"
                        alt="Savia Logo"
                        width={120}
                        height={40}
                        className={styles.logo}
                        priority
                    />
                </Link>

                {/* Carrito */}
                <Link href="/carrito" className={styles.cartWrapper}>
                    <Image
                        src="/icons/cart-fresh.svg"
                        alt="Carrito"
                        width={32}
                        height={32}
                        className={styles.cartIcon}
                    />
                    <span className={styles.cartBadge}>0</span>
                </Link>

            </div>
        </nav>
    );
}
