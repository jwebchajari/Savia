"use client";

import Image from "next/image";
import styles from "./Navbar.module.css";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import CartDrawer from "../Cart/CartDrawer";

export default function Navbar() {
    const { totalItems } = useCart();
    const [open, setOpen] = useState(false);

    return (
        <>
            <nav className={`navbar fixed-top bg-white ${styles.navbarShadow}`}>
                <div className="container d-flex justify-content-between align-items-center">

                    {/* Logo */}
                    <Link href="/" className="d-flex align-items-center">
                        <Image
                            src="/savia.jpg"
                            alt="Savia Logo"
                            width={120}
                            height={40}
                            priority
                        />
                    </Link>

                    {/* Carrito */}
                    <div
                        className={styles.cartWrapper}
                        onClick={() => setOpen(true)}
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
                    </div>

                </div>
            </nav>

            {/* Drawer */}
            <CartDrawer isOpen={open} close={() => setOpen(false)} />
        </>
    );
}
