"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import styles from "./WeeklyOffers.module.css";
import { useCart } from "@/context/CartContext";
import { getWeeklyOffers } from "@/services/productsService";

const GENERIC_IMG = "/placeholder-product.png"; // Poner esta imagen en /public

export default function WeeklyOffers() {
    const { addToCart } = useCart();

    const [products, setProducts] = useState([]);
    const [grams, setGrams] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            const data = await getWeeklyOffers();
            setProducts(data);
            setLoading(false);
        };
        fetchOffers();
    }, []);

    const handleGramChange = (id, value) => {
        const number = Math.max(0, Number(value));
        setGrams(prev => ({ ...prev, [id]: number }));
    };

    const adjustGrams = (id, change) => {
        setGrams(prev => {
            const current = prev[id] || 100;
            const newValue = Math.max(0, current + change);
            return { ...prev, [id]: newValue };
        });
    };

    const getFinalPrice = (producto, grams) => {
        if (!grams || grams <= 0) return 0;

        const priceOriginal = producto.precio;
        const priceOferta = producto.precioOferta ?? producto.precio;

        const pricePerGram = priceOferta / 1000;
        return Math.round(pricePerGram * grams);
    };

    if (loading) return null;
    if (products.length === 0) return null;

    return (
        <section className="container mt-4 mb-4">
            <h2 className={styles.title}> Ofertas Semanales</h2>

            <Swiper spaceBetween={16} slidesPerView="auto" className={styles.swiper}>
                {products.map((item) => {
                    const g = grams[item.id] ?? 100;
                    const finalPrice = getFinalPrice(item, g);

                    // Cálculo descuento real según precios
                    const discount = item.precioOferta
                        ? Math.round(((item.precio - item.precioOferta) / item.precio) * 100)
                        : 0;

                    const disabled = g === 0 || finalPrice === 0;

                    return (
                        <SwiperSlide key={item.id} className={styles.slide}>
                            <div className={styles.card}>

                                {/* Badge de descuento */}
                                {discount > 0 && (
                                    <span className={styles.badge}>-{discount}%</span>
                                )}

                                {/* Imagen */}
                                <div className={styles.imageWrapper}>
                                    <img
                                        src={item.imagen || GENERIC_IMG}
                                        alt={item.nombre}
                                        className={styles.productImg}
                                    />
                                </div>

                                <h3 className={styles.name}>{item.nombre}</h3>

                                <p className={styles.priceKg}>
                                    ${item.precioOferta ?? item.precio} / Kg
                                </p>

                                <div className={styles.gramControls}>
                                    <button
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
                                        className={styles.gramBtn}
                                        onClick={() => adjustGrams(item.id, +50)}
                                    >
                                        +50g
                                    </button>
                                </div>

                                <div className={styles.finalPrice}>
                                    ${finalPrice}
                                    <span className={styles.xgrams}> / {g}g</span>
                                </div>

                                <button
                                    className={`${styles.btn} ${disabled ? styles.btnDisabled : ""}`}
                                    disabled={disabled}
                                    onClick={() =>
                                        addToCart({
                                            name: `${item.nombre} (${g}g)`,
                                            slug: `${item.id}-${g}`,
                                            price: finalPrice,
                                            quantity: 1,
                                            image: item.imagen
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
