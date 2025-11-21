"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NavbarRoot from "@/_components/Navbar/NavbarRoot";
import { createProduct } from "@/services/productsService";
import styles from "./page.module.css";

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

export default function NuevoProductoPage() {
    const router = useRouter();
    const { user, isAdmin, loading } = useAuth();

    const [form, setForm] = useState({
        nombre: "",
        descripcion: "",
        categoria: "",
        precio: "",
        precioOferta: "",
        imagen: "",
        disponible: true,
        tipoVenta: "kg",
        ofertaGeneral: false,
        ofertaSemana: false,
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    if (loading) return null;
    if (!user || !isAdmin) {
        router.replace("/login");
        return null;
    }

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

            if (form.precioOferta !== "" && Number(form.precioOferta) >= Number(form.precio)) {
                setError("El precio de oferta debe ser menor al precio normal.");
                return;
            }

            setSaving(true);
            await createProduct(form);

            alert("Producto creado correctamente.");
            router.push("/root/productos");
        } catch (err) {
            console.error(err);
            setError(err.message);
            setSaving(false);
        }
    };

    return (
        <>
            <NavbarRoot />

            <main className="container py-5" style={{ marginTop: 80 }}>
                <h1 className="fw-bold mb-4">Crear nuevo producto</h1>

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

                    {/* Tipo de Venta */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Tipo de venta</label>
                        <select
                            className="form-select"
                            value={form.tipoVenta}
                            onChange={(e) => update("tipoVenta", e.target.value)}
                            required
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
                            required
                            min="0"
                        />
                        {form.tipoVenta === "kg" && (
                            <small className="text-muted">Precio por KG (el cliente podrá seleccionar gramos)</small>
                        )}
                        {form.tipoVenta === "u" && (
                            <small className="text-muted">Precio por unidad</small>
                        )}
                    </div>

                    {/* Precio oferta */}
                    <div className="mb-3">
                        <label className="form-label">Precio oferta (opcional)</label>
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

                    {/* ESTADOS VISUALES MEJORADOS */}
                    <div className="mt-4">
                        <label className="form-label fw-bold">Estado del producto</label>

                        <div className={styles.cardGroup}>

                            {/* Disponible */}
                            <div
                                onClick={() => update("disponible", !form.disponible)}
                                className={`${styles.cardToggle} ${form.disponible ? styles.cardGreen : ""}`}
                            >
                                <span>Disponible</span>
                                <span className={`${styles.dot} ${form.disponible ? styles.green : styles.gray}`}></span>
                            </div>

                            {/* Oferta General */}
                            <div
                                onClick={() => update("ofertaGeneral", !form.ofertaGeneral)}
                                className={`${styles.cardToggle} ${form.ofertaGeneral ? styles.cardOrange : ""}`}
                            >
                                <span>Oferta General</span>
                                <span className={`${styles.dot} ${form.ofertaGeneral ? styles.orange : styles.gray}`}></span>
                            </div>

                            {/* Oferta Semana */}
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
                        className="btn btn-savia px-4 py-2 mt-3"
                        disabled={saving}
                    >
                        {saving ? "Guardando..." : "Guardar producto"}
                    </button>
                </form>
            </main>
        </>
    );
}
