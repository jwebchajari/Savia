"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NavbarRoot from "@/_components/Navbar/NavbarRoot";
import ProductTable from "@/_components/Root/Products/ProductTable";
import ProductForm from "@/_components/Root/Products/ProductForm"; // ✅ ajustá el path real
import { getProducts, deleteProduct, updateProduct } from "@/services/productsService"; // ✅ updateProduct debe existir

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

    // ✅ Modal edición
    const [editing, setEditing] = useState(null); // product object
    const [savingEdit, setSavingEdit] = useState(false);

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
                setProducts(Array.isArray(data) ? data : []);
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
                (p.nombre || "").toLowerCase().includes(search.toLowerCase())
            );
        }

        if (category) result = result.filter((p) => p.categoria === category);

        if (availability === "disponible") result = result.filter((p) => !!p.disponible);
        if (availability === "agotado") result = result.filter((p) => !p.disponible);

        if (offerFilter === "general") result = result.filter((p) => !!p.ofertaGeneral);
        if (offerFilter === "semana") result = result.filter((p) => !!p.ofertaSemana);
        if (offerFilter === "none")
            result = result.filter((p) => !p.ofertaSemana && !p.ofertaGeneral);

        // sort (si lo usás)
        if (sort === "precio-asc") result.sort((a, b) => (a.precio ?? 0) - (b.precio ?? 0));
        if (sort === "precio-desc") result.sort((a, b) => (b.precio ?? 0) - (a.precio ?? 0));

        return result;
    }, [products, search, category, availability, offerFilter, sort]);

    /* -------------------------------
       ELIMINAR PRODUCTO
    -------------------------------- */
    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            setProducts((prev) => prev.filter((p) => p.id !== id));

            // si justo estabas editando ese producto, cerrá el modal
            setEditing((prev) => (prev?.id === id ? null : prev));
        } catch (err) {
            console.error("Error al eliminar:", err);
        }
    };

    /* -------------------------------
       ABRIR / CERRAR MODAL EDICIÓN
    -------------------------------- */
    const handleEditOpen = (product) => {
        setEditing(product);
    };

    const handleEditClose = () => {
        setEditing(null);
    };

    // Cerrar con ESC
    useEffect(() => {
        if (!editing) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") handleEditClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [editing]);

    /* -------------------------------
       GUARDAR EDICIÓN (SIN REDIRIGIR)
    -------------------------------- */
    const handleEditSubmit = async (formValues) => {
        if (!editing?.id) throw new Error("Falta el ID del producto.");

        setSavingEdit(true);
        try {
            // ✅ guardar en DB
            await updateProduct(editing.id, formValues);

            // ✅ actualizar en memoria (sin recargar ni navegar)
            setProducts((prev) =>
                prev.map((p) => (p.id === editing.id ? { ...p, ...formValues, id: editing.id } : p))
            );

            // ✅ cerrar modal
            handleEditClose();
        } finally {
            setSavingEdit(false);
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
            const XLSX = await import("xlsx");

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
     {/*        <NavbarRoot /> */}

            <main className="container py-5" style={{ marginTop: 80 }}>
                <h1>Productos</h1>

                {/* (Opcional) acá irían tus controles de filtros */}
                {/* search/category/availability/offerFilter/sort */}

                {loadingProducts ? (
                    <p>Cargando productos...</p>
                ) : (
                    <ProductTable
                        products={filteredProducts}
                        onDelete={handleDelete}
                        onExport={exportToExcel}
                        onEdit={handleEditOpen} // ✅ NUEVO
                    />
                )}
            </main>

            {/* ✅ MODAL EDICIÓN (sin bootstrap JS) */}
            {editing && (
                <div
                    className="modal fade show"
                    style={{ display: "block", background: "rgba(0,0,0,.55)" }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="editProductTitle"
                    onMouseDown={(e) => {
                        // click afuera => cerrar
                        if (e.target === e.currentTarget) handleEditClose();
                    }}
                >
                    <div
                        className="modal-dialog modal-dialog-centered modal-lg"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header">
                                <h5 className="modal-title" id="editProductTitle">
                                    Editar producto
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                    onClick={handleEditClose}
                                />
                            </div>

                            <div className="modal-body">
                                <ProductForm
                                    initialValues={editing}
                                    onSubmit={handleEditSubmit}
                                    submitting={savingEdit}
                                    submitLabel="Guardar cambios"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
