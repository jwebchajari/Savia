export async function generateMetadata({ params }) {
    const slug = params.id;

    // Diccionario de categorías (SEO-friendly)
    const CATEGORIES = {
        "vegano": "Vegano",
        "frutos-secos": "Frutos secos",
        "sin-lactosa": "Sin Lactosa",
        "sin-tacc": "Sin TACC",
        "sin-azucar": "Sin Azúcar",
        "yuyitos": "Yuyitos",
        "condimentos": "Condimentos",
        "suplementos-vitaminicos": "Suplementos vitamínicos",
        "suplementos-dietarios": "Suplementos dietarios",
        "ofertas": "Ofertas",
    };

    const categoryName =
        CATEGORIES[slug] ||
        slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    const title = `${categoryName} | Savia – Almacén Natural`;
    const description = `Comprá ${categoryName.toLowerCase()} en Savia, almacén natural en Chajarí. Productos saludables, naturales y de calidad.`;

    const url = `https://savia-sigma.vercel.app/categoria/${slug}`;

    return {
        title,
        description,

        alternates: {
            canonical: url,
        },

        openGraph: {
            title,
            description,
            url,
            siteName: "Savia – Almacén Natural",
            locale: "es_AR",
            type: "website",
            images: [
                {
                    url: "/og-image.jpg",
                    width: 1200,
                    height: 630,
                    alt: `Categoría ${categoryName} – Savia`,
                },
            ],
        },

        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/og-image.jpg"],
        },
    };
}

/* Layout simple: solo renderiza children */
export default function CategoriaLayout({ children }) {
    return children;
}
