"use client";

import { useState, useEffect } from "react";

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

const emptyProduct = {
    nombre: "",
    descripcion: "",
    categoria: "",
    precio: "",
    precioOferta: "",
    imagen: "",
    disponible: true,
    ofertaGeneral: false,
    ofertaSemana: false,
};

export default function ProductForm({
    initialValues,
    onSubmit,
    submitting,
    submitLabel = "Guardar",
}) {
    const [form, setForm] = useState(emptyProduct);
    const [error, setError] = useState("");

    useEffect(() => {
        if (initialValues) {
            setForm({
                nombre: initialValues.nombre || "",
                descripcion: initialValues.descripcion || "",
                categoria: initialValues.categoria || "",
                precio: initialValues.precio ?? "",
                precioOferta:
                    initialValues.precioOferta != null ? initialValues.precioOferta : "",
                imagen: initialValues.imagen || "",
                disponible:
                    typeof initialValues.disponible === "boolean"
                        ? initialValues.disponible
                        : true,
                ofertaGeneral: !!initialValues.ofertaGeneral,
                ofertaSemana: !!initialValues.ofertaSemana,
            });
        } else {
            setForm(emptyProduct);
        }
    }, [initialValues]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validaciones
        if (!form.nombre.trim()) return setError("El nombre es obligatorio.");
        if (!form.categoria.trim()) return setError("Seleccioná una categoría.");

        const precio = Number(form.precio);
        const oferta = Number(form.precioOferta);

        if (isNaN(precio) || precio <= 0)
            return setError("El precio debe ser un número válido.");

        if (form.precioOferta !== "" && !isNaN(oferta)) {
            if (oferta >= precio)
                return setError("El precio de oferta debe ser menor que el precio normal.");
        }

        try {
            await onSubmit(form);
        } catch (err) {
            console.error(err);
            setError(err.message || "Ocurrió un error al guardar.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0">

            {error && (
                <div className="alert alert-danger py-2 fw-bold small">{error}</div>
            )}

            <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea
                    name="descripcion"
                    className="form-control"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows={3}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Categoría</label>
                <select
                    name="categoria"
                    className="form-select"
                    value={form.categoria}
                    onChange={handleChange}
                    required
                >
                    <option value="">Seleccionar...</option>
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            <div className="row">
                <div className="mb-3 col-md-6">
                    <label className="form-label">Precio normal</label>
                    <input
                        type="number"
                        name="precio"
                        className="form-control"
                        min="1"
                        step="0.01"
                        value={form.precio}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3 col-md-6">
                    <label className="form-label">Precio de oferta</label>
                    <input
                        type="number"
                        name="precioOferta"
                        className="form-control"
                        min="1"
                        step="0.01"
                        value={form.precioOferta}
                        onChange={handleChange}
                        placeholder="Vacío si no aplica"
                    />
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label">URL de imagen</label>
                <input
                    type="text"
                    name="imagen"
                    className="form-control"
                    placeholder="https://..."
                    value={form.imagen}
                    onChange={handleChange}
                />
            </div>

            <div className="form-check mb-3">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="disponible"
                    name="disponible"
                    checked={form.disponible}
                    onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="disponible">
                    Disponible
                </label>
            </div>

            <div className="form-check mb-2">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="ofertaGeneral"
                    name="ofertaGeneral"
                    checked={form.ofertaGeneral}
                    onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="ofertaGeneral">
                    Oferta general
                </label>
            </div>

            <div className="form-check mb-3">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="ofertaSemana"
                    name="ofertaSemana"
                    checked={form.ofertaSemana}
                    onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="ofertaSemana">
                    Oferta de la semana
                </label>
            </div>

            <button
                type="submit"
                className="btn btn-savia w-100"
                disabled={submitting}
            >
                {submitting ? "Guardando..." : submitLabel}
            </button>
        </form>
    );
}
