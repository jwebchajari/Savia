"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NavbarRoot from "@/_components/Navbar/NavbarRoot";
import SuccessModal from "@/_components/Modals/SuccessModal";

import { getProductById, updateProduct } from "@/services/productsService";

import styles from "./page.module.css"; // usa las mismas clases que "nuevo producto"

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

export default function EditarProductoPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const { user, isAdmin, loading } = useAuth();

    const [form, setForm] = useState(null);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Modal de éxito
    const [showSuccess, setShowSuccess] = useState(false);

    // ⏳ Protección
    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.replace("/login");
        }
    }, [loading, user, isAdmin, router]);

    // 🔥 Cargar producto por ID
    useEffect(() => {
        const load = async () => {
            const data = await getProductById(id);

            if (!data) {
                setError("Producto no encontrado");
                return;
            }

            setForm({
                nombre: data.nombre,
                descripcion: data.descripcion || "",
                categoria: data.categoria || "",
                precio: data.precio,
                precioOferta: data.precioOferta ?? "",
                imagen: data.imagen || "",
                disponible: data.disponible,
                tipoVenta: data.tipoVenta ?? "kg",
                ofertaGeneral: data.ofertaGeneral || false,
                ofertaSemana: data.ofertaSemana || false,
            });

            setLoadingProduct(false);
        };

        load();
    }, [id]);

    const update = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            if (!form.nombre || !form.precio || !form.categoria) {
                setError("Completá nombre, precio y categoría.");
                return;
            }

            if (
                form.precioOferta !== "" &&
                Number(form.precioOferta) >= Number(form.precio)
            ) {
                setError("El precio de oferta debe ser menor al precio normal.");
                return;
            }

            setSaving(true);
            await updateProduct(id, form);

            // Mostrar modal
            setShowSuccess(true);

        } catch (err) {
            console.error(err);
            setError(err.message);
            setSaving(false);
        }
    };

    if (loadingProduct || !form) return null;

    return (
        <>
            <NavbarRoot />

            <main className="container py-5" style={{ marginTop: 80 }}>
                <h1 className="fw-bold mb-4">Editar producto</h1>

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
                        ></textarea>
                    </div>

                    {/* Categoría */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Categoría</label>
                        <select
                            className="form-select"
                            value={form.categoria}
                            onChange={(e) => update("categoria", e.target.value)}
                            required
                        >
                            <option value="">Seleccionar...</option>
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
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
                        <small className="text-muted">
                            {form.tipoVenta === "kg"
                                ? "Precio por KG (el cliente puede elegir gramos)"
                                : "Precio por unidad"}
                        </small>
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
                            placeholder="https://example.com/img.jpg"
                        />
                    </div>

                    {/* Vista previa imagen */}
                    {form.imagen && (
                        <div className="text-center mb-4">
                            <img
                                src={form.imagen}
                                alt="preview"
                                style={{ maxWidth: 180, borderRadius: 12 }}
                            />
                        </div>
                    )}

                    {/* ESTADOS VISUALES */}
                    <div className="mt-4">
                        <label className="form-label fw-bold">Estado del producto</label>

                        <div className={styles.cardGroup}>

                            <div
                                onClick={() => update("disponible", !form.disponible)}
                                className={`${styles.cardToggle} ${form.disponible ? styles.cardGreen : ""}`}
                            >
                                <span>Disponible</span>
                                <span className={`${styles.dot} ${form.disponible ? styles.green : styles.gray}`}></span>
                            </div>

                            <div
                                onClick={() => update("ofertaGeneral", !form.ofertaGeneral)}
                                className={`${styles.cardToggle} ${form.ofertaGeneral ? styles.cardOrange : ""}`}
                            >
                                <span>Oferta General</span>
                                <span className={`${styles.dot} ${form.ofertaGeneral ? styles.orange : styles.gray}`}></span>
                            </div>

                            <div
                                onClick={() => update("ofertaSemana", !form.ofertaSemana)}
                                className={`${styles.cardToggle} ${form.ofertaSemana ? styles.cardBlue : ""}`}
                            >
                                <span>Oferta Semana</span>
                                <span className={`${styles.dot} ${form.ofertaSemana ? styles.blue : styles.gray}`}></span>
                            </div>

                        </div>
                    </div>

                    {/* Error */}
                    {error && <div className="alert alert-danger mt-3">{error}</div>}

                    {/* Botón */}
                    <button
                        type="submit"
                        className="btn btn-savia px-4 py-2 mt-4"
                        disabled={saving}
                    >
                        {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                </form>
            </main>

            {/* Modal de éxito */}
            <SuccessModal
                show={showSuccess}
                title="Producto actualizado"
                message="Los cambios se guardaron correctamente."
                onClose={() => {
                    setShowSuccess(false);
                    router.push("/root/productos");
                }}
            />
        </>
    );
}
