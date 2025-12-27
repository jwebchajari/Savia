"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/services/productsService";
import { useCart } from "@/context/CartContext";
import styles from "./CategoryProducts.module.css";

const GENERIC_IMG = "/placeholder-product.png";

/** KG */
const GRAM_STEP = 50;
const DEFAULT_G = 100;

/** UNIDAD */
const UNIT_STEP = 1;
const DEFAULT_U = 1;

export default function CategoryProducts({ slug }) {
    const { addToCart } = useCart();
    const searchParams = useSearchParams();
    const focusId = searchParams.get("focus");

    const [productos, setProductos] = useState([]);
    const [amountById, setAmountById] = useState({});
    const [loading, setLoading] = useState(true);

    // ✅ detecta mobile (suficiente para tu caso)
    const isMobile =
        typeof window !== "undefined" && window.matchMedia
            ? window.matchMedia("(max-width: 575px)").matches
            : false;

    const decodedSlug = useMemo(
        () => (slug ? decodeURIComponent(slug) : ""),
        [slug]
    );

    const categoriaTexto = useMemo(
        () => decodedSlug.replace(/-/g, " "),
        [decodedSlug]
    );

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

    useEffect(() => {
        if (!decodedSlug) return;

        let alive = true;

        async function load() {
            try {
                setLoading(true);
                const all = await getProducts();
                const filtrados = all.filter((p) => p.categoriaSlug === decodedSlug);

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

    /** ===============================
     *  Amount handlers (grams/units)
     *  =============================== */
    const setAmount = (id, raw, step, fallback, { snap } = { snap: true }) => {
        let n = Number(raw);
        if (!Number.isFinite(n)) n = fallback;
        n = Math.max(0, n);

        // ✅ snap = redondeo por step (para gramos). En mobile lo evitamos mientras escribe.
        if (snap) {
            n = Math.round(n / step) * step;
        }

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
                        const isFocused = item.id === focusId;

                        const unitLabel = tipo === "u" ? "/ unidad" : "/ Kg";
                        const amountSuffix = tipo === "u" ? "u" : "g";

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
                                <div className={`${styles.card} ${isFocused ? styles.focused : ""}`}>
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

                                    {/* Precio base (con oferta si aplica) */}
                                    {hasOffer ? (
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


                                        </div>
                                    ) : (
                                        <div className={styles.gramControls}>


                                            <input
                                                type="number"
                                                min="0"
                                                step={GRAM_STEP}
                                                inputMode="numeric"
                                                className={styles.input}
                                                value={amount}
                                                onChange={(e) =>
                                                    // ✅ deja escribir cualquier número (mobile y desktop)
                                                    setAmount(item.id, e.target.value, GRAM_STEP, DEFAULT_G, {
                                                        snap: false,
                                                    })
                                                }
                                                onBlur={(e) =>
                                                    // ✅ en desktop vuelve a "snap" a múltiplos de 50 al salir
                                                    // ✅ en mobile NO snapea (queda libre)
                                                    setAmount(item.id, e.target.value, GRAM_STEP, DEFAULT_G, {
                                                        snap: !isMobile,
                                                    })
                                                }
                                                aria-label="Cantidad en gramos"
                                            />


                                        </div>
                                    )}

                                    {/* Total final */}
                                    <div className={styles.finalPrice}>
                                        {formatMoney(finalPrice)}
                                        <span className={styles.xgrams}>
                                            {" "}
                                            {tipo === "u"
                                                ? ` total (${amount}${amountSuffix})`
                                                : ` / ${amount}${amountSuffix}`}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className={`${styles.btn} ${disabled ? styles.btnDisabled : ""}`}
                                        disabled={disabled}
                                        onClick={() =>
                                            addToCart({
                                                name:
                                                    tipo === "u"
                                                        ? `${item.nombre} (${amount}u)`
                                                        : `${item.nombre} (${amount}g)`,
                                                slug:
                                                    tipo === "u"
                                                        ? `${item.id}-${amount}u`
                                                        : `${item.id}-${amount}g`,
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
