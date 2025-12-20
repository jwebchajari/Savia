"use client";

import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/services/productsService";
import styles from "./Buscar.module.css";

const PLACEHOLDER = "/placeholder-product.png";

const formatPrice = (value) =>
    new Intl.NumberFormat("es-AR").format(Number(value || 0));

export default function Buscar({ placeholder = "Buscar productos..." }) {
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    /* Cargar productos */
    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                const data = await getProducts();
                if (mounted) setProducts(data);
            } catch (err) {
                console.error("Error cargando productos:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => (mounted = false);
    }, []);

    /* Fuse */
    const fuse = useMemo(() => {
        if (!products.length) return null;

        return new Fuse(products, {
            keys: ["nombre"],
            threshold: 0.35,
            ignoreLocation: true,
            minMatchCharLength: 2,
        });
    }, [products]);

    /* Resultados */
    const results = useMemo(() => {
        if (!fuse || query.length < 2) return [];
        return fuse.search(query).slice(0, 6);
    }, [query, fuse]);

    return (
        <div className={styles.wrapper}>
            <input
                type="text"
                className={styles.input}
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            {query.length >= 2 && (
                <div className={styles.results}>
                    {loading && <div className={styles.itemEmpty}>Buscando…</div>}

                    {!loading && results.length === 0 && (
                        <div className={styles.itemEmpty}>Sin resultados</div>
                    )}

                    {!loading &&
                        results.map(({ item }) => {
                            const price = item.precioOferta ?? item.precio;

                            return (
                                <Link
                                    key={item.id}
                                    href={`/categoria/${item.categoriaSlug}?focus=${item.id}`}
                                    className={styles.item}
                                    onClick={() => setQuery("")}
                                >
                                    {/* Imagen */}
                                    <div className={styles.thumbWrap}>
                                        <Image
                                            src={item.imagen || PLACEHOLDER}
                                            alt={item.nombre}
                                            fill
                                            className={styles.thumb}
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className={styles.info}>
                                        <div className={styles.name}>{item.nombre}</div>

                                        <div className={styles.meta}>
                                            <span className={styles.price}>
                                                ${formatPrice(price)}
                                            </span>

                                            {item.precioOferta && (
                                                <span className={styles.offer}>Oferta</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                </div>
            )}
        </div>
    );
}
