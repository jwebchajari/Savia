"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import styles from "./WeeklyOffers.module.css";
import { useCart } from "@/context/CartContext";

// ICONOS MINIMALISTAS
import { Leaf, Cookie, Nut } from "lucide-react";

const offers = [
    {
        name: "Almendras",
        slug: "almendras",
        priceKg: 5000,
        discount: 20,
        icon: <Nut strokeWidth={1.8} className={styles.iconSvg} />
    },
    {
        name: "Granola Mix",
        slug: "granola-mix",
        priceKg: 4200,
        discount: 15,
        icon: <Cookie strokeWidth={1.8} className={styles.iconSvg} />
    },
    {
        name: "Yerba orgánica",
        slug: "yerba-organica",
        priceKg: 3600,
        discount: 10,
        icon: <Leaf strokeWidth={1.8} className={styles.iconSvg} />
    }
];

export default function WeeklyOffers() {
    const { addToCart } = useCart();
    const [grams, setGrams] = useState({});

    const handleGramChange = (slug, value) => {
        const number = Math.max(0, Number(value));
        setGrams(prev => ({ ...prev, [slug]: number }));
    };

    const adjustGrams = (slug, change) => {
        setGrams(prev => {
            const current = prev[slug] || 100;
            const newValue = Math.max(0, current + change);
            return { ...prev, [slug]: newValue };
        });
    };

    const getFinalPrice = (priceKg, discount, grams) => {
        if (grams <= 0) return 0;
        const pricePerGram = priceKg / 1000;
        const rawPrice = pricePerGram * grams;
        return Math.round(rawPrice - rawPrice * (discount / 100));
    };

    return (
        <section className="container mt-4 mb-4">
            <h2 className={styles.title}> Ofertas Semanales</h2>

            <Swiper spaceBetween={16} slidesPerView="auto" className={styles.swiper}>
                {offers.map((item, i) => {
                    const g = grams[item.slug] ?? 100;
                    const finalPrice = getFinalPrice(item.priceKg, item.discount, g);
                    const disabled = g === 0 || finalPrice === 0;

                    return (
                        <SwiperSlide key={i} className={styles.slide}>
                            <div className={styles.card}>

                                <span className={styles.badge}>-{item.discount}%</span>

                                <div className={styles.iconWrapper}>
                                    {item.icon}
                                </div>

                                <h3 className={styles.name}>{item.name}</h3>

                                <p className={styles.priceKg}>${item.priceKg} / Kg</p>

                                <div className={styles.gramControls}>
                                    <button
                                        className={styles.gramBtn}
                                        onClick={() => adjustGrams(item.slug, -50)}
                                    >
                                        -50g
                                    </button>

                                    <input
                                        type="number"
                                        min="0"
                                        step="50"
                                        className={styles.input}
                                        value={g}
                                        onChange={(e) => handleGramChange(item.slug, e.target.value)}
                                    />

                                    <button
                                        className={styles.gramBtn}
                                        onClick={() => adjustGrams(item.slug, +50)}
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
                                            name: `${item.name} (${g}g)`,
                                            slug: `${item.slug}-${g}`,
                                            price: finalPrice,
                                            quantity: 1
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
