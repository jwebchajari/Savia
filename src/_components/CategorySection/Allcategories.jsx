"use client";

import React from "react";
import CategorySection from "@/_components/CategorySection/CategorySection";

const categories = [
    {
        title: "Frutos Secos",
        description:
            "Ricos en fibra, antioxidantes y grasas saludables. Los frutos secos ayudan a mejorar la energía diaria, el corazón y la digestión.",
        img: "/category-banners/frutos-secos.png",
        link: "/frutos-secos",
    },
    {
        title: "Sin Lactosa",
        description:
            "Productos ligeros y fáciles de digerir. Ideales para quienes buscan bienestar digestivo sin dejar de disfrutar alimentos deliciosos.",
        img: "/category-banners/sin-lactosa.png",
        link: "/sin-lactosa",
    },
    {
        title: "Veganos",
        description:
            "Una alimentación basada en plantas aporta nutrientes esenciales, energía limpia y beneficios para la salud.",
        img: "/category-banners/vegano.png",
        link: "/vegano",
    },
    {
        title: "Sin TACC",
        description:
            "Opciones libres de gluten para quienes buscan cuidar su bienestar digestivo sin resignar sabor.",
        img: "/category-banners/sin-tacc.jpg",
        link: "/sin-tacc",
    },
    {
        title: "Sin Azúcar",
        description:
            "Productos sin azúcar añadida para quienes buscan reducir calorías o mantener una alimentación más saludable.",
        img: "/category-banners/sin-azucar.jpg",
        link: "/sin-azucar",
    },
    {
        title: "Yuyitos",
        description:
            "Infusiones naturales para relajarse, mejorar la digestión y equilibrar el bienestar.",
        img: "/category-banners/yuyitos.webp",
        link: "/yuyitos",
    },
    {
        title: "Ofertas",
        description:
            "Productos seleccionados con descuentos exclusivos para aprovechar cada semana.",
        img: "/category-banners/ofertas.png",
        link: "/ofertas",
    },
];

export default function Allcategories() {
    return (
        <div>
            {categories.map((cat, i) => (
                <CategorySection
                    key={i}
                    title={cat.title}
                    description={cat.description}
                    img={cat.img}
                    link={cat.link}
                />
            ))}
        </div>
    );
}
