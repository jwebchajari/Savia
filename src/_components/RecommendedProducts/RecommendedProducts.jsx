"use client";

import { useEffect, useMemo, useState } from "react";
import { getProducts } from "@/services/productsService";
import { useCart } from "@/context/CartContext";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import styles from "./RecommendedProducts.module.css";

const GENERIC_IMG = "/placeholder-product.png";

const formatPrice = (value) =>
    new Intl.NumberFormat("es-AR").format(Number(value || 0));

// Fisher–Yates shuffle (random estable por render)
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function RecommendedProducts({ limit = 10, title = "Te puede interesar" }) {
    const { addToCart } = useCart();

    const [products, setProducts] = useState([]);
    const [grams, setGrams] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;

        async function load() {
            try {
                setLoading(true);
                const all = await getProducts();

                // ✅ Opcional: solo disponibles
                const disponibles = all.filter((p) => p.disponible);

                const random = shuffleArray(disponibles).slice(0, limit);

                if (!alive) return;
                setProducts(random);
            } catch (e) {
                console.error("Error cargando recomendados:", e);
                if (!alive) return;
                setProducts([]);
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        }

        load();
        return () => {
            alive = false;
        };
    }, [limit]);

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

    // ✅ TODO ES $/Kg
    const getFinalPrice = (producto, gramsValue) => {
        if (!gramsValue || gramsValue <= 0) return 0;
        const priceBase = Number(producto.precioOferta ?? producto.precio ?? 0); // $/Kg
        const pricePerGram = priceBase / 1000;
        return Math.round(pricePerGram * gramsValue);
    };

    if (loading) return null;
    if (products.length === 0) return null;

    return (
        <section className="container mt-4 mb-4">
            <h2 className={styles.title}>{title}</h2>

            <Swiper spaceBetween={16} slidesPerView="auto" className={styles.swiper}>
                {products.map((item) => {
                    const g = grams[item.id] ?? 100;
                    const finalPrice = getFinalPrice(item, g);

                    const discount = item.precioOferta
                        ? Math.round(((item.precio - item.precioOferta) / item.precio) * 100)
                        : 0;

                    const disabled = g === 0 || finalPrice === 0;

                    return (
                        <SwiperSlide key={item.id} className={styles.slide}>
                            <div className={styles.card}>
                                {discount > 0 && <span className={styles.badge}>-{discount}%</span>}

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
                                        onChange={(e) => handleGramChange(item.id, e.target.value)}
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
                                    className={`${styles.btn} ${disabled ? styles.btnDisabled : ""}`}
                                    disabled={disabled}
                                    onClick={() =>
                                        addToCart({
                                            name: `${item.nombre} (${g}g)`,
                                            slug: `${item.id}-${g}`,
                                            price: finalPrice,
                                            quantity: 1,
                                            image: item.imagen,
                                        })
                                    }
                                >
                                    Agregar al carrito
                                </button>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </section>
    );
}
