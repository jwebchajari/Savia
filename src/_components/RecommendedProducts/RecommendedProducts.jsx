"use client";

import { useEffect, useMemo, useState } from "react";
import { getProducts } from "@/services/productsService";
import { useCart } from "@/context/CartContext";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import styles from "./RecommendedProducts.module.css";

const GENERIC_IMG = "/placeholder-product.png";

/** KG */
const GRAM_STEP = 50;
const DEFAULT_G = 100;

/** UNIDAD */
const UNIT_STEP = 1;
const DEFAULT_U = 1;

/* Fisher–Yates shuffle */
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function RecommendedProducts({
    limit = 10,
    title = "Te puede interesar",
}) {
    const { addToCart } = useCart();

    const [products, setProducts] = useState([]);
    const [amountById, setAmountById] = useState({}); // ✅ gramos o unidades
    const [loading, setLoading] = useState(true);

    // ✅ detecta mobile (para permitir "snap" solo en desktop)
    const isMobile =
        typeof window !== "undefined" && window.matchMedia
            ? window.matchMedia("(max-width: 575px)").matches
            : false;

    /* ===============================
       💲 Formateador ARS robusto
       =============================== */
    const moneyFmt = useMemo(
        () =>
            new Intl.NumberFormat("es-AR", {
                style: "currency",
                currency: "ARS",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }),
        []
    );

    const formatMoney = (value) => {
        const num =
            typeof value === "string"
                ? Number(value.replace(/[^\d.-]/g, ""))
                : Number(value);

        if (!Number.isFinite(num)) return moneyFmt.format(0);
        return moneyFmt.format(num);
    };

    // ✅ Detecta kg/unidad aunque venga como "u" o "unidad"
    const getTipoVenta = (item) => {
        const t = (item?.tipoVenta ?? "kg").toString().toLowerCase();
        return t === "u" || t === "unidad" ? "u" : "kg";
    };

    const parsePrecio = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    const hasValidOffer = (precio, oferta) =>
        Number.isFinite(oferta) && oferta > 0 && oferta < precio;

    // ✅ Label de cantidad: 150g | 1.25kg | 2u
    const formatAmountLabel = (tipo, amount) => {
        if (!amount || amount <= 0) return tipo === "u" ? "0u" : "0g";
        if (tipo === "u") return `${amount}u`;

        // gramos
        if (amount < 1000) return `${amount}g`;

        const kg = amount / 1000;
        if (Number.isInteger(kg)) return `${kg}kg`;
        return `${kg.toFixed(2).replace(/\.?0+$/, "")}kg`;
    };

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

    /** ===============================
     *  Amount handlers (grams/units)
     *  =============================== */
    const setAmount = (id, raw, step, fallback, { snap } = { snap: true }) => {
        let n = Number(raw);
        if (!Number.isFinite(n)) n = fallback;
        n = Math.max(0, n);

        if (snap) n = Math.round(n / step) * step;

        setAmountById((prev) => ({ ...prev, [id]: n }));
    };

    const adjustAmount = (id, delta, fallback) => {
        setAmountById((prev) => {
            const current = prev[id] ?? fallback;
            return { ...prev, [id]: Math.max(0, current + delta) };
        });
    };

    /** ===============================
     *  Price calc (kg/unidad)
     *  =============================== */
    const getFinalPrice = (item, amount) => {
        if (!amount || amount <= 0) return 0;

        const precio = parsePrecio(item?.precio);
        const oferta =
            item?.precioOferta != null ? parsePrecio(item.precioOferta) : null;

        const useOffer = hasValidOffer(precio, oferta);
        const base = useOffer ? oferta : precio;

        const tipo = getTipoVenta(item);

        // ✅ Por unidad: base es precio por unidad
        if (tipo === "u") return Math.round(base * amount);

        // ✅ Por kg: base es precio por KG → convertir a gramos
        return Math.round((base / 1000) * amount);
    };

    if (loading) return null;
    if (products.length === 0) return null;

    return (
        <section className="container mt-4 mb-4">
            <h2 className={styles.title}>{title}</h2>

            <Swiper spaceBetween={16} slidesPerView="auto" className={styles.swiper}>
                {products.map((item) => {
                    const tipo = getTipoVenta(item);

                    const precio = parsePrecio(item?.precio);
                    const oferta =
                        item?.precioOferta != null ? parsePrecio(item.precioOferta) : null;

                    const hasOffer = hasValidOffer(precio, oferta);

                    const amount =
                        amountById[item.id] ?? (tipo === "u" ? DEFAULT_U : DEFAULT_G);

                    const finalPrice = getFinalPrice(item, amount);

                    const discount = hasOffer
                        ? Math.round(((precio - oferta) / precio) * 100)
                        : 0;

                    const disabled = amount === 0 || finalPrice === 0;

                    const unitLabel = tipo === "u" ? "/ unidad" : "/ Kg";
                    const amountLabel = formatAmountLabel(tipo, amount);

                    // precio visible (tachado + actual)
                    const showOld = hasOffer;

                    return (
                        <SwiperSlide key={item.id} className={styles.slide}>
                            <div className={styles.card}>
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

                                {showOld ? (
                                    <div className={styles.priceRow}>
                                        <span className={styles.oldPrice}>
                                            {formatMoney(precio)}
                                            {tipo === "u" ? "" : " / Kg"}
                                        </span>
                                        <span className={styles.nowPrice}>
                                            {formatMoney(oferta)} {unitLabel}
                                        </span>
                                    </div>
                                ) : (
                                    <p className={styles.priceKg}>
                                        {formatMoney(precio)} {unitLabel}
                                    </p>
                                )}

                                {/* Controles según tipo */}
                                {tipo === "u" ? (
                                    <div className={styles.gramControls}>
                                        <button
                                            type="button"
                                            className={styles.gramBtn}
                                            onClick={() =>
                                                adjustAmount(item.id, -UNIT_STEP, DEFAULT_U)
                                            }
                                            aria-label="Restar 1 unidad"
                                        >
                                            -1
                                        </button>

                                        <input
                                            type="number"
                                            min="0"
                                            step={UNIT_STEP}
                                            inputMode="numeric"
                                            className={styles.input}
                                            value={amount}
                                            onChange={(e) =>
                                                setAmount(item.id, e.target.value, UNIT_STEP, DEFAULT_U, {
                                                    snap: true,
                                                })
                                            }
                                            aria-label="Cantidad de unidades"
                                        />

                                        <button
                                            type="button"
                                            className={styles.gramBtn}
                                            onClick={() =>
                                                adjustAmount(item.id, +UNIT_STEP, DEFAULT_U)
                                            }
                                            aria-label="Sumar 1 unidad"
                                        >
                                            +1
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.gramControls}>
                                        <button
                                            type="button"
                                            className={styles.gramBtn}
                                            onClick={() =>
                                                adjustAmount(item.id, -GRAM_STEP, DEFAULT_G)
                                            }
                                            aria-label="Restar 50 gramos"
                                        >
                                            -50g
                                        </button>

                                        <input
                                            type="number"
                                            min="0"
                                            step={GRAM_STEP}
                                            inputMode="numeric"
                                            className={styles.input}
                                            value={amount}
                                            onChange={(e) =>
                                                // ✅ escribir libre mientras tipea (mobile y desktop)
                                                setAmount(item.id, e.target.value, GRAM_STEP, DEFAULT_G, {
                                                    snap: false,
                                                })
                                            }
                                            onBlur={(e) =>
                                                // ✅ desktop: snap a múltiplos de 50; mobile: libre
                                                setAmount(item.id, e.target.value, GRAM_STEP, DEFAULT_G, {
                                                    snap: !isMobile,
                                                })
                                            }
                                            aria-label="Cantidad en gramos"
                                        />

                                        <button
                                            type="button"
                                            className={styles.gramBtn}
                                            onClick={() =>
                                                adjustAmount(item.id, +GRAM_STEP, DEFAULT_G)
                                            }
                                            aria-label="Sumar 50 gramos"
                                        >
                                            +50g
                                        </button>
                                    </div>
                                )}

                                {/* Total final */}
                                <div className={styles.finalPrice}>
                                    {formatMoney(finalPrice)}
                                    <span className={styles.xgrams}>
                                        {" "}
                                        {tipo === "u" ? `total (${amountLabel})` : `/ ${amountLabel}`}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className={`${styles.btn} ${disabled ? styles.btnDisabled : ""
                                        }`}
                                    disabled={disabled}
                                    onClick={() =>
                                        addToCart({
                                            name: `${item.nombre} (${amountLabel})`,
                                            slug: `${item.id}-${amountLabel}`,
                                            price: finalPrice,
                                            quantity: 1,
                                            image: item.imagen || GENERIC_IMG,
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
