"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProductTable from "@/_components/Root/Products/ProductTable";
import { getProducts, deleteProduct } from "@/services/productsService";
import NavbarRoot from "@/_components/Navbar/NavbarRoot";
import * as XLSX from "xlsx";

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
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [availability, setAvailability] = useState("");
    const [offerFilter, setOfferFilter] = useState("");
    const [sort, setSort] = useState("");

    const filterQuery = searchParams.get("filter");

    useEffect(() => {
        if (filterQuery === "ofertas") setOfferFilter("general");
        if (filterQuery === "semana") setOfferFilter("semana");
    }, [filterQuery]);

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) router.replace("/login");
    }, [loading, user, isAdmin, router]);

    useEffect(() => {
        if (!user || !isAdmin) return;

        const fetchProducts = async () => {
            setLoadingProducts(true);
            const data = await getProducts();
            setProducts(data);
            setLoadingProducts(false);
        };

        fetchProducts();
    }, [user, isAdmin]);

    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (search.trim()) result = result.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));
        if (category) result = result.filter(p => p.categoria === category);
        if (availability === "disponible") result = result.filter(p => p.disponible);
        if (availability === "agotado") result = result.filter(p => !p.disponible);

        if (offerFilter === "general") result = result.filter(p => p.ofertaGeneral);
        if (offerFilter === "semana") result = result.filter(p => p.ofertaSemana);
        if (offerFilter === "none") result = result.filter(p => !p.ofertaSemana && !p.ofertaGeneral);

        return result;
    }, [products, search, category, availability, offerFilter, sort]);

    const handleDelete = async (id) => {
        await deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    return (
        <>
            <NavbarRoot />

            <main className="container py-5" style={{ marginTop: 80 }}>
                <h1>Productos</h1>

                {/* filtros y tabla igual que antes */}
                {loadingProducts ? (
                    <p>Cargando...</p>
                ) : (
                    <ProductTable products={filteredProducts} onDelete={handleDelete} />
                )}
            </main>
        </>
    );
}
