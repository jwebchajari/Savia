"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NavbarRoot from "@/_components/Navbar/NavbarRoot";
import ProductTable from "@/_components/Root/Products/ProductTable";
import { getProducts, deleteProduct } from "@/services/productsService";

const CATEGORIES = [
    "Vegano",
    "Frutos secos",
    "Sin Lactosa",
    "Sin TACC",
    "Sin Azúcar",
    "Yuyitos",
    "Condimentos",
    "Suplementos vitamínicos",
    "Suplementos dietarios",
];

export default function ProductosRootClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAdmin, loading } = useAuth();

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    // filtros
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [availability, setAvailability] = useState("");
    const [offerFilter, setOfferFilter] = useState("");
    const [sort, setSort] = useState("");

    const filterQuery = searchParams.get("filter");

    /* -------------------------------
       FILTRO DESDE QUERYSTRING
    -------------------------------- */
    useEffect(() => {
        if (filterQuery === "ofertas") setOfferFilter("general");
        if (filterQuery === "semana") setOfferFilter("semana");
    }, [filterQuery]);

    /* -------------------------------
       PROTECCIÓN ADMIN
    -------------------------------- */
    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.replace("/login");
        }
    }, [loading, user, isAdmin, router]);

    /* -------------------------------
       CARGA DE PRODUCTOS
    -------------------------------- */
    useEffect(() => {
        if (!user || !isAdmin) return;

        const fetchProducts = async () => {
            setLoadingProducts(true);
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (error) {
                console.error("Error cargando productos:", error);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, [user, isAdmin]);

    /* -------------------------------
       FILTRADO MEMOIZADO
    -------------------------------- */
    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (search.trim()) {
            result = result.filter((p) =>
                p.nombre.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (category) result = result.filter((p) => p.categoria === category);

        if (availability === "disponible")
            result = result.filter((p) => p.disponible);

        if (availability === "agotado")
            result = result.filter((p) => !p.disponible);

        if (offerFilter === "general")
            result = result.filter((p) => p.ofertaGeneral);

        if (offerFilter === "semana")
            result = result.filter((p) => p.ofertaSemana);

        if (offerFilter === "none")
            result = result.filter(
                (p) => !p.ofertaSemana && !p.ofertaGeneral
            );

        return result;
    }, [products, search, category, availability, offerFilter, sort]);

    /* -------------------------------
       ELIMINAR PRODUCTO
    -------------------------------- */
    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            console.error("Error al eliminar:", err);
        }
    };

    /* -------------------------------
       EXPORTAR A EXCEL (SAFE)
    -------------------------------- */
    const exportToExcel = async (rows) => {
        if (!rows.length) {
            alert("No hay productos para exportar.");
            return;
        }

        try {
            const XLSX = await import("xlsx"); // ✅ dynamic import (clave)

            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
            XLSX.writeFile(workbook, "productos.xlsx");
        } catch (err) {
            console.error("Error exportando Excel:", err);
            alert("No se pudo generar el archivo.");
        }
    };

    if (loading) return null;

    return (
        <>
            <NavbarRoot />

            <main className="container py-5" style={{ marginTop: 80 }}>
                <h1>Productos</h1>

                {loadingProducts ? (
                    <p>Cargando productos...</p>
                ) : (
                    <ProductTable
                        products={filteredProducts}
                        onDelete={handleDelete}
                        onExport={exportToExcel} // opcional si tu tabla lo usa
                    />
                )}
            </main>
        </>
    );
}
