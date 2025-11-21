"use client";

import Link from "next/link";
import Image from "next/image";

export default function ProductTable({ products, onDelete }) {
    const handleDelete = async (id) => {
        const ok = window.confirm("¿Seguro que querés eliminar este producto?");
        if (!ok) return;
        await onDelete(id);
    };

    // Calcula % de descuento
    const calcularDescuento = (precio, oferta) => {
        if (!precio || !oferta) return null;
        return Math.round(((precio - oferta) / precio) * 100);
    };

    return (
        <div className="table-responsive">
            <table className="table table-striped align-middle text-center small">
                <thead className="table-light">
                    <tr>
                        <th style={{ minWidth: 70 }}>Img</th>
                        <th style={{ minWidth: 120 }}>Nombre</th>
                        <th>Categoría</th>
                        <th style={{ minWidth: 80 }}>Precio</th>
                        <th style={{ minWidth: 80 }}>Oferta</th>
                        <th style={{ minWidth: 80 }}>% OFF</th>
                        <th style={{ minWidth: 100 }}>Estado</th>
                        <th>G</th>
                        <th>S</th>
                        <th style={{ minWidth: 120 }} className="text-end">Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {products.length === 0 && (
                        <tr>
                            <td colSpan={10} className="py-4">No hay productos</td>
                        </tr>
                    )}

                    {products.map((p) => {
                        const descuento = calcularDescuento(p.precio, p.precioOferta);

                        return (
                            <tr key={p.id}>
                                {/* Imagen */}
                                <td>
                                    {p.imagen ? (
                                        <img src={p.imagen} alt={p.nombre} width={60} height={60} style={{ objectFit: "cover", borderRadius: 8 }} />

                                    ) : (
                                        <span className="text-muted">Sin imagen</span>
                                    )}
                                </td>

                                {/* Nombre */}
                                <td className="fw-semibold">{p.nombre}</td>

                                {/* Categoría */}
                                <td>{p.categoria}</td>

                                {/* Precio normal */}
                                <td className="fw-semibold text-danger">${p.precio}</td>

                                {/* Precio oferta */}
                                <td>
                                    {p.precioOferta ? (
                                        <strong className="text-success">${p.precioOferta}</strong>
                                    ) : (
                                        <span className="text-muted">—</span>
                                    )}
                                </td>

                                {/* % OFF */}
                                <td>
                                    {descuento ? (
                                        <span className="badge bg-success">-{descuento}%</span>
                                    ) : (
                                        <span className="text-muted">—</span>
                                    )}
                                </td>

                                {/* Disponible */}
                                <td>
                                    {p.disponible ? (
                                        <span className="badge bg-success">Disponible</span>
                                    ) : (
                                        <span className="badge bg-danger">Agotado</span>
                                    )}
                                </td>

                                {/* Oferta general */}
                                <td>{p.ofertaGeneral ? "✔️" : "—"}</td>

                                {/* Oferta semanal */}
                                <td>{p.ofertaSemana ? "✔️" : "—"}</td>

                                {/* Acciones */}
                                <td className="text-end">
                                    <Link
                                        href={`/root/productos/${p.id}/editar`}
                                        className="btn btn-sm btn-outline-primary me-2"
                                    >
                                        ✏️
                                    </Link>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(p.id)}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
