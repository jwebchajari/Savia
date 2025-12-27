"use client";

import { useState, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import styles from "./WeeklyOffers.module.css";
import { useCart } from "@/context/CartContext";
import { getWeeklyOffers } from "@/services/productsService";

const GENERIC_IMG = "/placeholder-product.png";

/** KG */
const GRAM_STEP = 50;
const DEFAULT_G = 100;

/** UNIDAD */
const UNIT_STEP = 1;
const DEFAULT_U = 1;

export default function WeeklyOffers() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [amountById, setAmountById] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ detecta mobile
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

  // ✅ Muestra "g" o "kg" según el total (solo para tipo kg)
  const formatAmountLabel = (tipo, amount) => {
    if (!amount || amount <= 0) return tipo === "u" ? "0u" : "0g";

    if (tipo === "u") return `${amount}u`;

    // tipo === "kg" => amount son gramos
    if (amount < 1000) return `${amount}g`;

    // >= 1000g => mostrar en kg
    const kg = amount / 1000;

    // si es exacto (1kg, 2kg, etc) no mostramos decimales
    if (Number.isInteger(kg)) return `${kg}kg`;

    // si no, hasta 2 decimales sin ceros finales (1.50 -> 1.5)
    const str = kg.toFixed(2).replace(/\.?0+$/, "");
    return `${str}kg`;
  };

  const parsePrecio = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const hasValidOffer = (precio, oferta) =>
    Number.isFinite(oferta) && oferta > 0 && oferta < precio;

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await getWeeklyOffers();
        setProducts(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  /** ===============================
   *  Amount handlers (grams/units)
   *  =============================== */
  const setAmount = (id, raw, step, fallback, { snap } = { snap: true }) => {
    let n = Number(raw);
    if (!Number.isFinite(n)) n = fallback;
    n = Math.max(0, n);

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
   *  Price calc
   *  =============================== */
  const getFinalPrice = (item, amount) => {
    if (!amount || amount <= 0) return 0;

    const precio = parsePrecio(item?.precio);
    const oferta =
      item?.precioOferta != null ? parsePrecio(item.precioOferta) : null;

    const useOffer = hasValidOffer(precio, oferta);
    const base = useOffer ? oferta : precio;

    const tipo = getTipoVenta(item);

    if (tipo === "u") return Math.round(base * amount);
    return Math.round((base / 1000) * amount);
  };

  if (loading || products.length === 0) return null;

  return (
    <section className="container mt-4 mb-4">
      <h2 className={styles.title}>Ofertas Semanales</h2>

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
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = GENERIC_IMG;
                    }}
                  />
                </div>

                <h3 className={styles.name}>{item.nombre}</h3>

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
                    <button
                      className={styles.gramBtn}
                      onClick={() => adjustAmount(item.id, -UNIT_STEP, DEFAULT_U)}
                      type="button"
                      aria-label="Restar 1 unidad"
                    >
                      -1
                    </button>

                    <input
                      type="number"
                      step={UNIT_STEP}
                      min="0"
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
                      className={styles.gramBtn}
                      onClick={() => adjustAmount(item.id, +UNIT_STEP, DEFAULT_U)}
                      type="button"
                      aria-label="Sumar 1 unidad"
                    >
                      +1
                    </button>
                  </div>
                ) : (
                  <div className={styles.gramControls}>
                    <button
                      className={styles.gramBtn}
                      onClick={() => adjustAmount(item.id, -GRAM_STEP, DEFAULT_G)}
                      type="button"
                      aria-label="Restar 50 gramos"
                    >
                      -50g
                    </button>

                    <input
                      type="number"
                      step={GRAM_STEP}
                      min="0"
                      inputMode="numeric"
                      className={styles.input}
                      value={amount}
                      onChange={(e) =>
                        setAmount(item.id, e.target.value, GRAM_STEP, DEFAULT_G, {
                          snap: false,
                        })
                      }
                      onBlur={(e) =>
                        setAmount(item.id, e.target.value, GRAM_STEP, DEFAULT_G, {
                          snap: !isMobile,
                        })
                      }
                      aria-label="Cantidad en gramos"
                    />

                    <button
                      className={styles.gramBtn}
                      onClick={() => adjustAmount(item.id, +GRAM_STEP, DEFAULT_G)}
                      type="button"
                      aria-label="Sumar 50 gramos"
                    >
                      +50g
                    </button>
                  </div>
                )}

                {/* ✅ Total final: si pasa 1000g muestra kg */}
                <div className={styles.finalPrice}>
                  {formatMoney(finalPrice)}
                  <span className={styles.xgrams}>
                    {" "}
                    {tipo === "u" ? ` total (${amountLabel})` : ` / ${amountLabel}`}
                  </span>
                </div>

                <button
                  className={`${styles.btn} ${disabled ? styles.btnDisabled : ""}`}
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
                  type="button"
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
