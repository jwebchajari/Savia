"use client";

import { useState, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import styles from "./WeeklyOffers.module.css";
import { useCart } from "@/context/CartContext";
import { getWeeklyOffers } from "@/services/productsService";

const GENERIC_IMG = "/placeholder-product.png";
const STEP = 50;
const DEFAULT_G = 100;

export default function WeeklyOffers() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [grams, setGrams] = useState({});
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchOffers = async () => {
      const data = await getWeeklyOffers();
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    fetchOffers();
  }, []);

  const handleGramChange = (id, value) => {
    let n = Number(value);
    if (!Number.isFinite(n)) n = DEFAULT_G;
    n = Math.max(0, n);
    n = Math.round(n / STEP) * STEP;

    setGrams((prev) => ({ ...prev, [id]: n }));
  };

  const adjustGrams = (id, change) => {
    setGrams((prev) => {
      const current = prev[id] ?? DEFAULT_G;
      return { ...prev, [id]: Math.max(0, current + change) };
    });
  };

  const getFinalPrice = (item, g) => {
    if (!g || g <= 0) return 0;

    const precio = Number(item?.precio) || 0;
    const oferta =
      item?.precioOferta != null ? Number(item.precioOferta) : null;

    const hasOffer =
      Number.isFinite(oferta) && oferta > 0 && oferta < precio;

    const precioKg = hasOffer ? oferta : precio;
    return Math.round((precioKg / 1000) * g);
  };

  if (loading || products.length === 0) return null;

  return (
    <section className="container mt-4 mb-4">
      <h2 className={styles.title}>Ofertas Semanales</h2>

      <Swiper spaceBetween={16} slidesPerView="auto" className={styles.swiper}>
        {products.map((item) => {
          const g = grams[item.id] ?? DEFAULT_G;

          const precio = Number(item?.precio) || 0;
          const oferta =
            item?.precioOferta != null ? Number(item.precioOferta) : null;

          const hasOffer =
            Number.isFinite(oferta) && oferta > 0 && oferta < precio;

          const finalPrice = getFinalPrice(item, g);

          const discount = hasOffer
            ? Math.round(((precio - oferta) / precio) * 100)
            : 0;

          const disabled = g === 0 || finalPrice === 0;

          return (
            <SwiperSlide key={item.id} className={styles.slide}>
              <div className={styles.card}>
                {discount > 0 && (
                  <span className={styles.badge}>-{discount}%</span>
                )}

                {/* Imagen (todas iguales, cover) */}
                <div className={styles.imageWrapper}>
                  <img
                    src={item.imagen || GENERIC_IMG}
                    alt={item.nombre}
                    className={styles.productImg}
                    loading="lazy"
                  />
                </div>

                <h3 className={styles.name}>{item.nombre}</h3>

                {/* Precio anterior + actual */}
                {hasOffer ? (
                  <div className={styles.priceRow}>
                    <span className={styles.oldPrice}>
                      {formatMoney(precio)}
                    </span>
                    <span className={styles.nowPrice}>
                      {formatMoney(oferta)} / Kg
                    </span>
                  </div>
                ) : (
                  <p className={styles.priceKg}>
                    {formatMoney(precio)} / Kg
                  </p>
                )}

                {/* Gramos */}
                <div className={styles.gramControls}>
                  <button
                    className={styles.gramBtn}
                    onClick={() => adjustGrams(item.id, -50)}
                    type="button"
                  >
                    -50g
                  </button>

                  <input
                    type="number"
                    step={STEP}
                    className={styles.input}
                    value={g}
                    onChange={(e) =>
                      handleGramChange(item.id, e.target.value)
                    }
                  />

                  <button
                    className={styles.gramBtn}
                    onClick={() => adjustGrams(item.id, +50)}
                    type="button"
                  >
                    +50g
                  </button>
                </div>

                {/* Precio final */}
                <div className={styles.finalPrice}>
                  {formatMoney(finalPrice)}
                  <span className={styles.xgrams}> / {g}g</span>
                </div>

                <button
                  className={`${styles.btn} ${
                    disabled ? styles.btnDisabled : ""
                  }`}
                  disabled={disabled}
                  onClick={() =>
                    addToCart({
                      name: `${item.nombre} (${g}g)`,
                      slug: `${item.id}-${g}`,
                      price: finalPrice,
                      quantity: 1,
                      image: item.imagen,
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
