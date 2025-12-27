"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NavbarRoot from "@/_components/Navbar/NavbarRoot";
import Link from "next/link";
import ProductosRootClient from "./todos-los-productos/ProductosRootClient";

export default function RootPage() {
    const router = useRouter();
    const { user, isAdmin, loading } = useAuth();

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.replace("/login");
        }
    }, [loading, user, isAdmin, router]);

    if (loading || !user || !isAdmin) return null;

    return (
        <>

            <main className="container" >
            <ProductosRootClient/>
            </main>
        </>
    );
}
