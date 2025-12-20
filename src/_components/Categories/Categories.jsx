"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import Buscar from "@/_components/Buscar/Buscar";
import styles from "./Categories.module.css";

const PLACEHOLDER = "/placeholder-category.png";

const categories = [
    { name: "Vegano", slug: "vegano", img: "/categories/vegano.png" },
    { name: "Frutos secos", slug: "frutos-secos", img: "/categories/frutos-secos.png" },
    { name: "Sin Lactosa", slug: "sin-lactosa", img: "/categories/sin-lactosa.png" },
    { name: "Sin TACC", slug: "sin-tacc", img: "/categories/sin-tacc.png" },
    { name: "Sin Azúcar", slug: "sin-azucar", img: "/categories/sin-azucar.png" },
    { name: "Yuyitos", slug: "yuyitos", img: "/categories/yuyitos.png" },
    { name: "Condimentos", slug: "condimentos", img: "/categories/condimentos.png" },
    { name: "Suplementos vitamínicos", slug: "suplementos-vitaminicos", img: "/categories/suplementos-vitaminicos.png" },
    { name: "Suplementos dietarios", slug: "suplementos-dietarios", img: null },
    { name: "Ofertas", slug: "ofertas", img: "/categories/ofertas.png" },
];

export default function CategoriesCarousel() {
    const router = useRouter();

    return (
        <section className="container mt-4 mb-4">
            <h2 className={styles.title}>Categorías</h2>

            {/* 🔍 BUSCADOR DE PRODUCTOS (Firebase + Fuse) */}
            <div className={styles.searchWrap}>
                <Buscar
                    placeholder="Buscar productos…"
                    onSelect={(product) => {
                        // OPCIÓN A: ir al producto
                        // router.push(`/producto/${product.id}`);

                        // OPCIÓN B (recomendada ahora): ir a la categoría
                        if (product.categoriaSlug) {
                            router.push(`/categoria/${product.categoriaSlug}`);
                        }
                    }}
                />
            </div>

            {/* MOBILE → SWIPER */}
            <div className={styles.mobileOnly}>
                <Swiper slidesPerView="auto" spaceBetween={16}>
                    {categories.map((cat) => (
                        <SwiperSlide key={cat.slug} className={styles.slide}>
                            <CategoryItem {...cat} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* DESKTOP → GRID */}
            <div className={styles.desktopOnly}>
                <div className={styles.desktopGrid}>
                    {categories.map((cat) => (
                        <div key={cat.slug} className={styles.desktopItem}>
                            <CategoryItem {...cat} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CategoryItem({ name, slug, img }) {
    const src = img || PLACEHOLDER;

    return (
        <Link href={`/categoria/${slug}`} className={styles.item}>
            <div className={styles.circle}>
                <Image
                    src={src}
                    alt={name}
                    fill
                    sizes="(max-width: 768px) 80px, 110px"
                    className={styles.image}
                />
            </div>
            <span className={styles.name}>{name}</span>
        </Link>
    );
}
