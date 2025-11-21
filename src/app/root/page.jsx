"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NavbarRoot from "@/_components/Navbar/NavbarRoot";
import ProductTable from "@/_components/Root/Products/ProductTable";
import { getProducts, deleteProduct } from "@/services/productsService";
import * as XLSX from "xlsx";

// Las mismas categorías del sistema
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

export default function ProductosRootPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAdmin, loading } = useAuth();

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    // CONTROLADORES DE FILTROS
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

    // Proteger ruta
    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.replace("/login");
        }
    }, [loading, user, isAdmin, router]);

    // Cargar productos
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

    // FILTRO + ORDENAMIENTO
    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (search.trim()) {
            result = result.filter((p) =>
                p.nombre.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (category) {
            result = result.filter((p) => p.categoria === category);
        }

        if (availability === "disponible") {
            result = result.filter((p) => p.disponible);
        } else if (availability === "agotado") {
            result = result.filter((p) => !p.disponible);
        }

        if (offerFilter === "general") {
            result = result.filter((p) => p.ofertaGeneral);
        } else if (offerFilter === "semana") {
            result = result.filter((p) => p.ofertaSemana);
        } else if (offerFilter === "none") {
            result = result.filter((p) => !p.ofertaSemana && !p.ofertaGeneral);
        }

        if (sort === "alph-asc") {
            result.sort((a, b) => a.nombre.localeCompare(b.nombre));
        } else if (sort === "alph-desc") {
            result.sort((a, b) => b.nombre.localeCompare(a.nombre));
        } else if (sort === "price-asc") {
            result.sort((a, b) => a.precio - b.precio);
        } else if (sort === "price-desc") {
            result.sort((a, b) => b.precio - a.precio);
        } else if (sort === "discount") {
            result.sort((a, b) => {
                const d1 = a.precioOferta ? (a.precio - a.precioOferta) / a.precio : 0;
                const d2 = b.precioOferta ? (b.precio - b.precioOferta) / b.precio : 0;
                return d2 - d1;
            });
        }

        return result;
    }, [products, search, category, availability, offerFilter, sort]);

    // ELIMINAR
    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            console.error("Error al eliminar producto:", err);
        }
    };

    // EXPORTAR EXCEL
    const exportToExcel = (rows) => {
        if (!rows || rows.length === 0) {
            alert("No hay productos para exportar.");
            return;
        }

        const exportData = rows.map((p) => ({
            ID: p.id,
            Nombre: p.nombre,
            Descripción: p.descripcion,
            Categoría: p.categoria,
            Precio: p.precio,
            PrecioOferta: p.precioOferta ?? "",
            Descuento:
                p.precioOferta
                    ? Math.round(((p.precio - p.precioOferta) / p.precio) * 100) + "%"
                    : "",
            Disponible: p.disponible ? "Sí" : "No",
            OfertaGeneral: p.ofertaGeneral ? "Sí" : "No",
            OfertaSemana: p.ofertaSemana ? "Sí" : "No",
            Imagen: p.imagen,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

        XLSX.writeFile(workbook, "productos.xlsx");
    };

    if (loading || (!user && !isAdmin)) return null;

    return (
        <>
            <NavbarRoot />

            <main className="container py-5" style={{ marginTop: 80 }}>

                {/* HEADER */}
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
                    <h1 className="fw-bold m-0">Productos</h1>

                    <div className="d-flex gap-2 flex-wrap">

                        {/* NUEVO PRODUCTO */}
                        <button
                            className="btn btn-savia px-3"
                            onClick={() => router.push("/root/productos/nuevo")}
                        >
                            Nuevo producto
                        </button>

                        {/* IMPORTAR */}
                        <button
                            className="btn btn-outline-primary px-3"
                            onClick={() => router.push("/root/productos/importar")}
                        >
                            Importar Excel
                        </button>

                        {/* DESCARGAR PLANTILLA */}
                        <a
                            href="/mnt/data/plantillaProductos.xlsx"
                            download
                            className="btn btn-outline-secondary px-3"
                        >
                            Descargar plantilla
                        </a>

                        {/* EXPORTAR */}
                        <button
                            className="btn btn-outline-success px-3"
                            onClick={() => exportToExcel(filteredProducts)}
                        >
                            Exportar Excel
                        </button>

                    </div>
                </div>

                {/* FILTROS */}
                <div className="card p-3 shadow-sm mb-4">
                    <div className="row g-3">

                        <div className="col-12 col-md-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar por nombre..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="col-6 col-md-2">
                            <select
                                className="form-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">Categoría</option>
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-6 col-md-2">
                            <select
                                className="form-select"
                                value={availability}
                                onChange={(e) => setAvailability(e.target.value)}
                            >
                                <option value="">Estado</option>
                                <option value="disponible">Disponible</option>
                                <option value="agotado">Agotado</option>
                            </select>
                        </div>

                        <div className="col-6 col-md-2">
                            <select
                                className="form-select"
                                value={offerFilter}
                                onChange={(e) => setOfferFilter(e.target.value)}
                            >
                                <option value="">Ofertas</option>
                                <option value="general">Oferta general</option>
                                <option value="semana">Semana</option>
                                <option value="none">Sin oferta</option>
                            </select>
                        </div>

                        <div className="col-6 col-md-2">
                            <select
                                className="form-select"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="">Ordenar</option>
                                <option value="alph-asc">A → Z</option>
                                <option value="alph-desc">Z → A</option>
                                <option value="price-asc">Precio ↑</option>
                                <option value="price-desc">Precio ↓</option>
                                <option value="discount">% Descuento</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                {loadingProducts ? (
                    <p>Cargando productos...</p>
                ) : (
                    <ProductTable products={filteredProducts} onDelete={handleDelete} />
                )}

            </main>
        </>
    );
}
