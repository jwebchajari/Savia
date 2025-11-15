"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import styles from "./Categories.module.css";

const categories = [
    { name: "Vegano", slug: "vegano", img: "/categories/veganos.png" },
    { name: "Frutos secos", slug: "frutos-secos", img: "/categories/frutos-secos.png" },
    { name: "Sin Lactosa", slug: "sin-lactosa", img: "/categories/sin-lactosa.png" },
    { name: "Sin TACC", slug: "sin-tacc", img: "/categories/sin-tacc.png" },
    { name: "Sin Azúcar", slug: "sin-azucar", img: "/categories/sin-azucar.png" },
    { name: "Yuyitos", slug: "yuyitos", img: "/categories/yuyitos.png" },
    { name: "Ofertas", slug: "ofertas", img: "/categories/ofertas.png" },
];

export default function CategoriesCarousel() {
    const [query, setQuery] = useState("");

    const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <section className="container mt-4 mb-4">

            <h2 className={styles.title}>Categorías</h2>

            {/* Barra de búsqueda */}
            <input
                type="text"
                placeholder="Buscar categoría..."
                className={styles.search}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            {/* Swiper Carrusel */}
            <div className={styles.swiperWrapper}>
                <Swiper
                    spaceBetween={20}
                    slidesPerView="auto"
                    navigation
                    modules={[Navigation]}
                    centeredSlides={false}
                    breakpoints={{
                        992: {
                            centeredSlides: true,
                        },
                    }}
                    className={styles.swiper}
                >
                    {filtered.map((cat) => (
                        <SwiperSlide key={cat.slug} className={styles.slide}>
                            <Link href={`/categoria/${cat.slug}`} className={styles.item}>
                                <div className={styles.circle}>
                                    <Image
                                        src={cat.img}
                                        alt={cat.name}
                                        fill
                                        className={styles.image}
                                    />
                                </div>
                                <span className={styles.name}>{cat.name}</span>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}
