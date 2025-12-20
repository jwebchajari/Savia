"use client";

import { useCart } from "@/context/CartContext";
import styles from "./CarritoPage.module.css";
import { useEffect, useMemo, useState } from "react";
import { rtdb } from "@/firebase/firebase";
import { ref, get } from "firebase/database";
import Link from "next/link";
import Navbar from "@/_components/Navbar/Navbar";

const GENERIC_IMG = "/placeholder-product.png";

const formatPrice = (value) =>
  new Intl.NumberFormat("es-AR").format(Number(value || 0));

export default function CarritoPage() {
  const {
    cart,
    addToCart,
    decreaseQty,
    removeFromCart,
    totalPrice,
    deliveryMethod,
    setDeliveryMethod,
  } = useCart();

  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // ✅ Datos del local desde Firebase (local/datosComerciales)
  const [storeData, setStoreData] = useState({
    delivery: 0,
    direccion: "",
    redes: { whatsapp: "" },
    horarios: null,
  });
  const [loadingStore, setLoadingStore] = useState(true);

  useEffect(() => {
    let cancel = false;

    async function loadStoreData() {
      try {
        setLoadingStore(true);

        const snap = await get(ref(rtdb, "local/datosComerciales"));

        const data = snap.exists() ? snap.val() : {};

        const deliveryRaw = data?.delivery ?? 0;
        const deliveryParsed =
          typeof deliveryRaw === "number" ? deliveryRaw : Number(deliveryRaw);

        const normalized = {
          delivery: Number.isFinite(deliveryParsed) ? deliveryParsed : 0,
          direccion: data?.direccion || "",
          redes: {
            whatsapp: data?.redes?.whatsapp || "",
            instagram: data?.redes?.instagram || "",
            facebook: data?.redes?.facebook || "",
            email: data?.redes?.email || "",
            telegram: data?.redes?.telegram || "",
          },
          horarios: data?.horarios ?? null,
        };

        if (!cancel) setStoreData(normalized);
      } catch (err) {
        console.error("Error leyendo local/datosComerciales:", err);
        if (!cancel) {
          setStoreData({
            delivery: 0,
            direccion: "",
            redes: { whatsapp: "" },
            horarios: null,
          });
        }
      } finally {
        if (!cancel) setLoadingStore(false);
      }
    }

    loadStoreData();
    return () => {
      cancel = true;
    };
  }, []);

  const costoEnvio = deliveryMethod === "domicilio" ? storeData.delivery : 0;

  const totalFinal = useMemo(
    () => Number(totalPrice || 0) + Number(costoEnvio || 0),
    [totalPrice, costoEnvio]
  );

  const itemsCount = useMemo(
    () => cart.reduce((acc, it) => acc + (it.quantity || 0), 0),
    [cart]
  );

  const sendToWhatsApp = () => {
    // ✅ toma whatsapp desde Firebase si existe, si no usa fallback
    const phoneFromDb = String(storeData?.redes?.whatsapp || "").replace(/\D/g, "");
    const phone = phoneFromDb ? `549${phoneFromDb}` : "5493412275598";

    let msg = `🛒 *Pedido Savia*\n\n`;

    msg += `Entrega: ${
      deliveryMethod === "domicilio" ? "Domicilio" : "Retiro en local"
    }\n`;

    if (deliveryMethod === "domicilio") {
      msg += `📍 Dirección: ${address || "No indicada"}\n`;
    } else {
      // ✅ dirección del local desde Firebase
      if (storeData.direccion) {
        msg += `🏪 Retiro en: ${storeData.direccion}\n`;
      }
    }

    if (notes) msg += `📝 Notas: ${notes}\n`;

    msg += `\n*Productos:*\n`;

    cart.forEach((i) => {
      msg += `• ${i.name} x${i.quantity} — $${formatPrice(
        Number(i.price || 0) * Number(i.quantity || 0)
      )}\n`;
    });

    msg += `\nSubtotal: $${formatPrice(totalPrice)}`;

    if (deliveryMethod === "domicilio") {
      msg += `\nEnvío: $${formatPrice(costoEnvio)}`;
    }

    msg += `\n\n*TOTAL: $${formatPrice(totalFinal)}*`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  const domicilioDisabled = loadingStore; // deshabilitar hasta tener costo

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <div className={styles.drawer}>
          {/* HEADER */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>Tu carrito</h1>
              <span className={styles.countBadge}>{itemsCount}</span>
            </div>

            <Link href="/" className={styles.backLink}>
              Seguir comprando
            </Link>
          </div>

          {/* CONTENIDO */}
          <div className={styles.contentScroll}>
            {cart.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>Carrito vacío</p>
                <p className={styles.emptySub}>Agregá productos para continuar 😊</p>
              </div>
            ) : (
              <div className={styles.items}>
                {cart.map((item) => {
                  const img = item.image || GENERIC_IMG;
                  const unit = Number(item.price || 0);
                  const qty = Number(item.quantity || 0);
                  const lineTotal = unit * qty;

                  return (
                    <div key={item.slug} className={styles.itemCard}>
                      <div className={styles.itemRow}>
                        <div className={styles.thumbWrap}>
                          <img
                            src={img}
                            alt={item.name}
                            className={styles.thumb}
                            onError={(e) => {
                              e.currentTarget.src = GENERIC_IMG;
                            }}
                          />
                        </div>

                        <div className={styles.itemInfo}>
                          <div className={styles.itemName}>{item.name}</div>

                          <div className={styles.itemMeta}>
                            <span>${formatPrice(unit)}</span>
                            <span className={styles.dot}>•</span>
                            <span className={styles.lineTotal}>
                              ${formatPrice(lineTotal)}
                            </span>
                          </div>

                          <div className={styles.controls}>
                            <button
                              type="button"
                              className={styles.qtyBtn}
                              onClick={() => decreaseQty(item.slug)}
                            >
                              −
                            </button>

                            <span className={styles.qty}>{qty}</span>

                            <button
                              type="button"
                              className={styles.qtyBtn}
                              onClick={() => addToCart(item)}
                            >
                              +
                            </button>

                            <button
                              type="button"
                              className={styles.removeBtn}
                              onClick={() => removeFromCart(item.slug)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ENTREGA */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Entrega</div>

              <label className={styles.option}>
                <input
                  type="radio"
                  checked={deliveryMethod === "retiro"}
                  onChange={() => setDeliveryMethod("retiro")}
                />
                <span>
                  Retiro en el local{" "}
                  {storeData.direccion ? `(${storeData.direccion})` : "(sin costo)"}
                </span>
              </label>

              <label
                className={styles.option}
                style={domicilioDisabled ? { opacity: 0.7 } : undefined}
                title={domicilioDisabled ? "Cargando costo de envío..." : undefined}
              >
                <input
                  type="radio"
                  checked={deliveryMethod === "domicilio"}
                  onChange={() => setDeliveryMethod("domicilio")}
                  disabled={domicilioDisabled}
                />
                <span>
                  Envío a domicilio{" "}
                  {loadingStore
                    ? "(cargando...)"
                    : `(+ $${formatPrice(storeData.delivery)})`}
                </span>
              </label>
            </div>

            {deliveryMethod === "domicilio" && (
              <div className={styles.section}>
                <input
                  className={styles.input}
                  placeholder="Dirección"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />

                <textarea
                  className={styles.textarea}
                  placeholder="Notas"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className={styles.footer}>
            <div className={styles.totalRowFinal}>
              <span>Total</span>
              <strong>${formatPrice(totalFinal)}</strong>
            </div>

            <button
              className={styles.checkoutBtn}
              disabled={cart.length === 0}
              onClick={sendToWhatsApp}
            >
              Finalizar compra por WhatsApp
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
