"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import styles from "./Categories.module.css";

const categories = [
    { name: "Vegano", slug: "vegano", img: "/categories/vegano.png" },
    { name: "Frutos secos", slug: "frutos-secos", img: "/categories/frutos-secos.png" },
    { name: "Sin Lactosa", slug: "sin-lactosa", img: "/categories/sin-lactosa.png" },
    { name: "Sin TACC", slug: "sin-tacc", img: "/categories/sin-tacc.png" },
    { name: "Sin Azúcar", slug: "sin-azucar", img: "/categories/sin-azucar.png" },
    { name: "Yuyitos", slug: "yuyitos", img: "/categories/yuyitos.png" },
    { name: "Condimentos", slug: "condimentos", img: "/categories/condimentos.png" },
    { name: "Suplementos vitamínicos", slug: "suplementos-vitaminicos", img: "/categories/suplementos-vitaminicos.png" },
    { name: "Suplementos dietarios", slug: "suplementos-dietarios", img: "/categories/suplementos-dietarios.png" },
    { name: "Ofertas", slug: "ofertas", img: "/categories/ofertas.png" },
];

export default function CategoriesCarousel() {
    const [query, setQuery] = useState("");
    const [isMobile, setIsMobile] = useState(false);

    const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <section className="container mt-4 mb-4">
            <h2 className={styles.title}>Categorías</h2>

            {/* BUSCADOR */}
            <input
                type="text"
                placeholder="Buscar categoría..."
                className={styles.search}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            {/* MOBILE → SWIPER */}
            {isMobile && (
                <Swiper slidesPerView="auto" spaceBetween={20} className={styles.swiper}>
                    {filtered.map((cat) => (
                        <SwiperSlide key={cat.slug} className={styles.slide}>
                            <CategoryItem {...cat} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}

            {/* DESKTOP → GRID */}
            {!isMobile && (
                <div className={styles.desktopGrid}>
                    {filtered.map((cat) => (
                        <div key={cat.slug} className={styles.desktopItem}>
                            <CategoryItem {...cat} />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

function CategoryItem({ name, slug, img }) {
    return (
        <Link href={`/categoria/${slug}`} className={styles.item}>
            <div className={styles.circle}>
                <Image src={img} alt={name} fill className={styles.image} />
            </div>
            <span className={styles.name}>{name}</span>
        </Link>
    );
}
