"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NavbarRoot from "@/_components/Navbar/NavbarRoot";
import Link from "next/link";

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
            <NavbarRoot />

            <main className="container py-5" >
                <h1 className="mb-4">Bienvenido Root</h1>
                <p className="text-muted mb-4">Panel de administración</p>

                <div className="row g-4">

                    {/* ---------------------- */}
                    {/*    PRODUCTOS          */}
                    {/* ---------------------- */}
                    <div className="col-12 col-md-4">
                        <div className="card shadow-sm p-4">
                            <h4 className="mb-3">Productos</h4>
                            <p className="text-muted mb-3">
                                Gestioná los productos del catálogo.
                            </p>

                            <Link href="/root/productos/todos-los-productos" className="btn btn-savia w-100 mb-2">
                                Ver productos
                            </Link>

                            <Link href="/root/productos/nuevo" className="btn btn-outline-primary w-100">
                                Crear producto
                            </Link>
                        </div>
                    </div>

                    {/* ---------------------- */}
                    {/*   DATOS COMERCIALES   */}
                    {/* ---------------------- */}
                    <div className="col-12 col-md-4">
                        <div className="card shadow-sm p-4">
                            <h4 className="mb-3">Datos comerciales</h4>
                            <p className="text-muted mb-3">
                                Información del local: redes, ubicación, delivery y más.
                            </p>

                            <Link href="/root/datos" className="btn btn-savia w-100">
                                Editar datos del local
                            </Link>
                        </div>
                    </div>

                    {/* ---------------------- */}
                    {/*      MIS PEDIDOS      */}
                    {/* ---------------------- */}
                    <div className="col-12 col-md-4">
                        <div className="card shadow-sm p-4">
                            <h4 className="mb-3">Mis pedidos</h4>
                            <p className="text-muted mb-3">
                                Anotador para registrar ventas del día o pedidos pendientes.
                            </p>

                            <Link href="/root/pedidos" className="btn btn-savia w-100">
                                Ir al anotador
                            </Link>
                        </div>
                    </div>

                </div>
            </main>
        </>
    );
}
