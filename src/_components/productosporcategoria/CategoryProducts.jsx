"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/services/productsService";

export default function CategoryProducts({ slug }) {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Si aún no hay slug, mostrar algo temporal
    if (!slug) return <p>Cargando...</p>;

    // Convertir slug en un texto bonito
    const categoriaTexto = slug.replace(/-/g, " ");

    useEffect(() => {
        async function load() {
            const all = await getProducts();

            // 🔥 Filtrar usando categoriaSlug
            const filtrados = all.filter(
                (p) => p.categoriaSlug === slug
            );

            setProductos(filtrados);
            setLoading(false);
        }

        load();
    }, [slug]);

    if (loading) return <p>Cargando productos...</p>;

    return (
        <div className="container py-4">

            <h1 className="mb-4 text-capitalize">{categoriaTexto}</h1>

            {productos.length === 0 && (
                <p className="text-muted">No hay productos en esta categoría.</p>
            )}

            <div className="row g-3">
                {productos.map((prod) => (
                    <div key={prod.id} className="col-6 col-md-4 col-lg-3">
                        <div className="card shadow-sm h-100">
                            <img
                                src={prod.imagen}
                                alt={prod.nombre}
                                className="card-img-top"
                                style={{ height: 160, objectFit: "cover" }}
                            />

                            <div className="card-body">
                                <h5 className="card-title mb-2">{prod.nombre}</h5>

                                {prod.descripcion && (
                                    <p className="text-muted small">{prod.descripcion}</p>
                                )}

                                {!prod.precioOferta && (
                                    <p className="fw-bold mb-1">${prod.precio}</p>
                                )}

                                {prod.precioOferta && (
                                    <>
                                        <p className="text-decoration-line-through text-muted small">
                                            ${prod.precio}
                                        </p>
                                        <p className="text-success fw-bold mb-1">
                                            Oferta: ${prod.precioOferta}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
