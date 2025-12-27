"use client";

import { useEffect, useState } from "react";
import SuccessModal from "@/_components/Modals/SuccessModal";
import { getProductById, updateProduct } from "@/services/productsService";
import styles from "./page.module.css"; // ✅ reutiliza tus estilos de toggles (ajustá ruta si cambia)

// Generar slug sin espacios ni tildes
function slugify(str) {
    return (str || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
}

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

const TIPO_VENTA = [
    { value: "kg", label: "Por KG (permite vender por gramos)" },
    { value: "u", label: "Por unidad (precio final por unidad)" },
];

/**
 * Props:
 * - show: boolean
 * - productId: string (opcional si pasás product)
 * - product: object (opcional si pasás productId)
 * - onClose: () => void
 * - onSaved: (updatedProduct) => void   // para actualizar lista sin recargar
 */
export default function EditProductModal({ show, productId, product, onClose, onSaved }) {
    const id = productId ?? product?.id;

    const [form, setForm] = useState(null);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    // Cargar producto (si ya viene completo desde la tabla, lo usamos igual y opcionalmente refrescamos)
    useEffect(() => {
        if (!show) return;

        const hydrateFromData = (data) => {
            setForm({
                nombre: data.nombre || "",
                descripcion: data.descripcion || "",
                categoriaNombre: data.categoriaNombre || data.categoria || "",
                categoriaSlug: data.categoriaSlug || slugify(data.categoriaNombre || data.categoria || ""),
                precio: data.precio ?? "",
                precioOferta: data.precioOferta ?? "",
                imagen: data.imagen || "",
                disponible: typeof data.disponible === "boolean" ? data.disponible : true,
                tipoVenta: data.tipoVenta ?? "kg",
                ofertaGeneral: !!data.ofertaGeneral,
                ofertaSemana: !!data.ofertaSemana,
            });
        };

        const load = async () => {
            setError("");
            setLoadingProduct(true);

            // 1) si vino product desde la tabla, lo mostramos instantáneo
            if (product) hydrateFromData(product);

            // 2) refrescamos desde DB para estar seguros (y porque la tabla a veces no trae todo)
            if (id) {
                const data = await getProductById(id);
                if (!data) {
                    setError("Producto no encontrado");
                    setLoadingProduct(false);
                    return;
                }
                hydrateFromData(data);
            }

            setLoadingProduct(false);
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, id]);

    // cerrar con ESC
    useEffect(() => {
        if (!show) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [show, onClose]);

    const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            if (!id) {
                setError("Falta el ID del producto.");
                return;
            }

            if (!form.nombre || !form.precio || !form.categoriaNombre) {
                setError("Completá nombre, precio y categoría.");
                return;
            }

            if (form.precioOferta !== "" && Number(form.precioOferta) >= Number(form.precio)) {
                setError("El precio de oferta debe ser menor al precio normal.");
                return;
            }

            setSaving(true);

            // payload final (incluye categoriaSlug consistente)
            const payload = {
                ...form,
                categoriaSlug: form.categoriaSlug || slugify(form.categoriaNombre),
            };

            await updateProduct(id, payload);

            // ✅ avisar al padre para actualizar tabla
            onSaved?.({ ...payload, id });

            setShowSuccess(true);
        } catch (err) {
            console.error(err);
            setError(err?.message || "Error guardando producto");
            setSaving(false);
        }
    };

    if (!show) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="modal fade show"
                style={{ display: "block", background: "rgba(0,0,0,.55)" }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="editProductTitle"
                onMouseDown={(e) => {
                    if (e.target === e.currentTarget) onClose?.();
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
                            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
                        </div>

                        <div className="modal-body">
                            {loadingProduct || !form ? null : (
                                <form className="card p-4 shadow-sm" onSubmit={handleSubmit}>
                                    {/* Nombre */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Nombre</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={form.nombre}
                                            onChange={(e) => update("nombre", e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Descripción */}
                                    <div className="mb-3">
                                        <label className="form-label">Descripción</label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            value={form.descripcion}
                                            onChange={(e) => update("descripcion", e.target.value)}
                                        />
                                    </div>

                                    {/* Categoría */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Categoría</label>
                                        <select
                                            className="form-select"
                                            value={form.categoriaNombre}
                                            onChange={(e) => {
                                                const nombre = e.target.value;
                                                update("categoriaNombre", nombre);
                                                update("categoriaSlug", slugify(nombre));
                                            }}
                                            required
                                        >
                                            <option value="">Seleccionar...</option>
                                            {CATEGORIES.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Tipo de venta */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Tipo de venta</label>
                                        <select
                                            className="form-select"
                                            value={form.tipoVenta}
                                            onChange={(e) => update("tipoVenta", e.target.value)}
                                        >
                                            {TIPO_VENTA.map((t) => (
                                                <option key={t.value} value={t.value}>
                                                    {t.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Precio */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Precio</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={form.precio}
                                            onChange={(e) => update("precio", e.target.value)}
                                            min="0"
                                            required
                                        />
                                    </div>

                                    {/* Precio oferta */}
                                    <div className="mb-3">
                                        <label className="form-label">Precio oferta</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={form.precioOferta}
                                            onChange={(e) => update("precioOferta", e.target.value)}
                                            min="0"
                                        />
                                    </div>

                                    {/* Imagen */}
                                    <div className="mb-3">
                                        <label className="form-label">Imagen (URL)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={form.imagen}
                                            onChange={(e) => update("imagen", e.target.value)}
                                        />
                                    </div>

                                    {/* Vista previa */}
                                    {form.imagen && (
                                        <div className="text-center mb-4">
                                            <img src={form.imagen} alt="" style={{ maxWidth: 180, borderRadius: 12 }} />
                                        </div>
                                    )}

                                    {/* Estados */}
                                    <div className="mt-4">
                                        <label className="form-label fw-bold">Estado del producto</label>

                                        <div className={styles.cardGroup}>
                                            <div
                                                onClick={() => update("disponible", !form.disponible)}
                                                className={`${styles.cardToggle} ${form.disponible ? styles.cardGreen : ""}`}
                                                role="button"
                                            >
                                                <span>Disponible</span>
                                            </div>

                                            <div
                                                onClick={() => update("ofertaGeneral", !form.ofertaGeneral)}
                                                className={`${styles.cardToggle} ${form.ofertaGeneral ? styles.cardOrange : ""}`}
                                                role="button"
                                            >
                                                <span>Oferta General</span>
                                            </div>

                                            <div
                                                onClick={() => update("ofertaSemana", !form.ofertaSemana)}
                                                className={`${styles.cardToggle} ${form.ofertaSemana ? styles.cardBlue : ""}`}
                                                role="button"
                                            >
                                                <span>Oferta Semana</span>
                                            </div>
                                        </div>
                                    </div>

                                    {error && <div className="alert alert-danger mt-3">{error}</div>}

                                    <button type="submit" className="btn btn-savia px-4 py-2 mt-4" disabled={saving}>
                                        {saving ? "Guardando..." : "Guardar cambios"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ SuccessModal sin redirect */}
            <SuccessModal
                show={showSuccess}
                title="Producto actualizado"
                message="Los cambios se guardaron correctamente."
                onClose={() => {
                    setShowSuccess(false);
                    setSaving(false);
                    onClose?.(); // ✅ cerrar modal de edición y quedarse en la tabla
                }}
            />
        </>
    );
}
