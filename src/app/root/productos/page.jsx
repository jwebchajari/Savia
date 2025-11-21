"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NavbarRoot from "@/_components/Navbar/NavbarRoot";
import ProductTable from "@/_components/Root/Products/ProductTable";
import { getProducts, deleteProduct } from "@/services/productsService";

export default function ProductosRootPage() {
    const router = useRouter();
    const { user, isAdmin, loading } = useAuth();

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    // Proteger ruta
    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.replace("/login");
        }
    }, [loading, user, isAdmin, router]);

    useEffect(() => {
        if (!user || !isAdmin) return;
        const fetchProducts = async () => {
            try {
                setLoadingProducts(true);
                const data = await getProducts();
                setProducts(data);
            } catch (err) {
                console.error("Error al cargar productos:", err);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, [user, isAdmin]);

    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            console.error("Error al eliminar producto:", err);
        }
    };

    if (loading || (!user && !isAdmin)) return null;

    return (
        <>
            <NavbarRoot />
            <main className="container py-5" style={{ marginTop: "80px" }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>Productos</h1>
                    <button
                        className="btn btn-savia"
                        onClick={() => router.push("/root/productos/nuevo")}
                    >
                        Nuevo producto
                    </button>
                </div>

                {loadingProducts ? (
                    <p>Cargando productos...</p>
                ) : (
                    <ProductTable products={products} onDelete={handleDelete} />
                )}
            </main>
        </>
    );
}
