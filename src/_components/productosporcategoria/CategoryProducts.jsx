"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/services/productsService";
import { useCart } from "@/context/CartContext";
import styles from "./CategoryProducts.module.css";

const GENERIC_IMG = "/placeholder-product.png";

const formatPrice = (value) =>
    new Intl.NumberFormat("es-AR").format(Number(value || 0));

export default function CategoryProducts({ slug }) {
    const { addToCart } = useCart();
    const searchParams = useSearchParams();
    const focusId = searchParams.get("focus");

    const [productos, setProductos] = useState([]);
    const [grams, setGrams] = useState({});
    const [loading, setLoading] = useState(true);

    const decodedSlug = useMemo(
        () => (slug ? decodeURIComponent(slug) : ""),
        [slug]
    );

    const categoriaTexto = useMemo(
        () => decodedSlug.replace(/-/g, " "),
        [decodedSlug]
    );

    useEffect(() => {
        if (!decodedSlug) return;

        let alive = true;

        async function load() {
            try {
                setLoading(true);
                const all = await getProducts();
                const filtrados = all.filter(
                    (p) => p.categoriaSlug === decodedSlug
                );

                if (!alive) return;
                setProductos(filtrados);
            } catch (err) {
                console.error("Error cargando productos por categoría:", err);
                if (!alive) return;
                setProductos([]);
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        }

        load();
        return () => {
            alive = false;
        };
    }, [decodedSlug]);

    const handleGramChange = (id, value) => {
        const number = Math.max(0, Number(value));
        setGrams((prev) => ({ ...prev, [id]: number }));
    };

    const adjustGrams = (id, change) => {
        setGrams((prev) => {
            const current = prev[id] ?? 100;
            const newValue = Math.max(0, current + change);
            return { ...prev, [id]: newValue };
        });
    };

    // 👉 TODO ES $ / Kg
    const getFinalPrice = (producto, gramsValue) => {
        if (!gramsValue || gramsValue <= 0) return 0;

        const priceBase = Number(
            producto.precioOferta ?? producto.precio ?? 0
        ); // $/Kg
        const pricePerGram = priceBase / 1000;

        return Math.round(pricePerGram * gramsValue);
    };

    if (!slug) return <p>Cargando...</p>;
    if (loading) return <p>Cargando productos...</p>;

    return (
        <section className="container mt-4 mb-4">
            <h2 className={styles.title}>{categoriaTexto}</h2>

            {productos.length === 0 ? (
                <p className="text-muted text-center">
                    No hay productos en esta categoría.
                </p>
            ) : (
                <div className={styles.grid}>
                    {productos.map((item) => {
                        const g = grams[item.id] ?? 100;
                        const finalPrice = getFinalPrice(item, g);

                        const discount = item.precioOferta
                            ? Math.round(
                                ((item.precio - item.precioOferta) / item.precio) * 100
                            )
                            : 0;

                        const disabled = g === 0 || finalPrice === 0;
                        const isFocused = item.id === focusId;

                        return (
                            <div
                                key={item.id}
                                className={styles.gridItem}
                                ref={(el) => {
                                    if (isFocused && el) {
                                        setTimeout(() => {
                                            el.scrollIntoView({
                                                behavior: "smooth",
                                                block: "center",
                                            });
                                        }, 300);
                                    }
                                }}
                            >
                                <div
                                    className={`${styles.card} ${isFocused ? styles.focused : ""
                                        }`}
                                >
                                    {discount > 0 && (
                                        <span className={styles.badge}>-{discount}%</span>
                                    )}

                                    <div className={styles.imageWrapper}>
                                        <img
                                            src={item.imagen || GENERIC_IMG}
                                            alt={item.nombre}
                                            className={styles.productImg}
                                            onError={(e) => {
                                                e.currentTarget.src = GENERIC_IMG;
                                            }}
                                        />
                                    </div>

                                    <h3 className={styles.name}>{item.nombre}</h3>

                                    <p className={styles.priceKg}>
                                        ${formatPrice(item.precioOferta ?? item.precio)} / Kg
                                    </p>

                                    <div className={styles.gramControls}>
                                        <button
                                            type="button"
                                            className={styles.gramBtn}
                                            onClick={() => adjustGrams(item.id, -50)}
                                        >
                                            -50g
                                        </button>

                                        <input
                                            type="number"
                                            min="0"
                                            step="50"
                                            className={styles.input}
                                            value={g}
                                            onChange={(e) =>
                                                handleGramChange(item.id, e.target.value)
                                            }
                                        />

                                        <button
                                            type="button"
                                            className={styles.gramBtn}
                                            onClick={() => adjustGrams(item.id, +50)}
                                        >
                                            +50g
                                        </button>
                                    </div>

                                    <div className={styles.finalPrice}>
                                        ${formatPrice(finalPrice)}
                                        <span className={styles.xgrams}> por {g}g</span>
                                    </div>

                                    <button
                                        type="button"
                                        className={`${styles.btn} ${disabled ? styles.btnDisabled : ""
                                            }`}
                                        disabled={disabled}
                                        onClick={() =>
                                            addToCart({
                                                name: `${item.nombre} (${g}g)`,
                                                slug: `${item.id}-${g}`,
                                                price: finalPrice,
                                                quantity: 1,
                                                image: item.imagen || GENERIC_IMG,
                                            })
                                        }
                                    >
                                        Agregar al carrito
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
