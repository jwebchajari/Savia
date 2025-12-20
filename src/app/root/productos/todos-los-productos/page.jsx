"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { getProducts, deleteProduct } from "@/services/productsService";

// ⛔ Import dinámico (evita prerender issues)
const NavbarRoot = dynamic(
    () => import("@/_components/Navbar/NavbarRoot"),
    { ssr: false }
);

const ProductTable = dynamic(
    () => import("@/_components/Root/Products/ProductTable"),
    { ssr: false }
);

export default function ProductosRootClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAdmin, loading } = useAuth();

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    const [search, setSearch] = useState("");
    const [availability, setAvailability] = useState("");
    const [offerFilter, setOfferFilter] = useState("");

    /* ---------------------------
       QUERY FILTER
    ---------------------------- */
    useEffect(() => {
        const filter = searchParams.get("filter");
        if (filter === "ofertas") setOfferFilter("general");
        if (filter === "semana") setOfferFilter("semana");
    }, [searchParams]);

    /* ---------------------------
       PROTECCIÓN ADMIN
    ---------------------------- */
    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.replace("/login");
        }
    }, [loading, user, isAdmin, router]);

    /* ---------------------------
       FETCH PRODUCTS
    ---------------------------- */
    useEffect(() => {
        if (!user || !isAdmin) return;

        const fetchProducts = async () => {
            try {
                setLoadingProducts(true);
                const data = await getProducts();
                setProducts(data);
            } catch (err) {
                console.error("Error cargando productos:", err);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, [user, isAdmin]);

    /* ---------------------------
       FILTROS
    ---------------------------- */
    const filteredProducts = useMemo(() => {
        let list = [...products];

        if (search.trim()) {
            list = list.filter((p) =>
                p.nombre.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (availability === "disponible") {
            list = list.filter((p) => p.disponible);
        }

        if (availability === "agotado") {
            list = list.filter((p) => !p.disponible);
        }

        if (offerFilter === "general") {
            list = list.filter((p) => p.ofertaGeneral);
        }

        if (offerFilter === "semana") {
            list = list.filter((p) => p.ofertaSemana);
        }

        return list;
    }, [products, search, availability, offerFilter]);

    /* ---------------------------
       DELETE
    ---------------------------- */
    const handleDelete = async (id) => {
        const ok = confirm("¿Eliminar producto?");
        if (!ok) return;

        try {
            await deleteProduct(id);
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            console.error("Error eliminando:", err);
        }
    };

    if (loading) return null;

    return (
        <>
            <NavbarRoot />

            <main className="container py-5" style={{ marginTop: 80 }}>
                <h1 className="mb-4">Productos</h1>

                {loadingProducts ? (
                    <p>Cargando productos…</p>
                ) : (
                    <ProductTable
                        products={filteredProducts}
                        onDelete={handleDelete}
                    />
                )}
            </main>
        </>
    );
}
