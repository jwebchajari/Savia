"use client";

import { useCart } from "@/context/CartContext";
import styles from "./CartDrawer.module.css";
import { useEffect, useMemo, useState } from "react";
import { rtdb } from "@/firebase/firebase";
import { ref, get } from "firebase/database";

const GENERIC_IMG = "/placeholder-product.png";

const formatPrice = (value) =>
  new Intl.NumberFormat("es-AR").format(Number(value || 0));

export default function CartDrawer({ isOpen, close }) {
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

  // ✅ costo de envío desde Firebase
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [deliveryCostLoading, setDeliveryCostLoading] = useState(true);

  useEffect(() => {
    // Si querés, podés traerlo siempre al montar.
    // Acá lo traigo cuando se abre el drawer (menos llamadas).
    if (!isOpen) return;

    let cancelled = false;

    async function loadDeliveryCost() {
      try {
        setDeliveryCostLoading(true);

        const snap = await get(
          ref(rtdb, "local/datosComerciales/delivery")
        );

        const value = snap.exists() ? snap.val() : 0;

        // Acepta number o string numérico
        const parsed = typeof value === "number" ? value : Number(value);

        if (!cancelled) {
          setDeliveryCost(Number.isFinite(parsed) ? parsed : 0);
        }
      } catch (err) {
        console.error("Error leyendo costo de delivery:", err);
        if (!cancelled) setDeliveryCost(0);
      } finally {
        if (!cancelled) setDeliveryCostLoading(false);
      }
    }

    loadDeliveryCost();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const costoEnvio = deliveryMethod === "domicilio" ? deliveryCost : 0;

  const totalFinal = useMemo(() => {
    return Number(totalPrice || 0) + Number(costoEnvio || 0);
  }, [totalPrice, costoEnvio]);

  const itemsCount = useMemo(
    () => cart.reduce((acc, it) => acc + (it.quantity || 0), 0),
    [cart]
  );

  /* --------------------------------------
     ENVIAR A WHATSAPP
  -------------------------------------- */
  const sendToWhatsApp = () => {
    const phone = "5493412275598";

    let message = `🛒 *Nuevo pedido desde Savia*\n\n`;

    message += `*Método de entrega:* ${deliveryMethod === "domicilio" ? "Envío a domicilio" : "Retiro en el local"
      }\n`;

    if (deliveryMethod === "domicilio") {
      message += `📍 *Dirección:* ${address || "No indicada"}\n`;
    }

    if (notes) {
      message += `📝 *Notas:* ${notes}\n`;
    }

    message += `\n*Productos:*\n`;

    cart.forEach((item) => {
      const lineTotal =
        (Number(item.price || 0) * Number(item.quantity || 0)) || 0;
      message += `• ${item.name} x${item.quantity} — $${formatPrice(
        lineTotal
      )}\n`;
    });

    message += `\nSubtotal: $${formatPrice(totalPrice)}`;
    if (deliveryMethod === "domicilio") {
      message += `\nEnvío: $${formatPrice(costoEnvio)}`;
    }
    message += `\n\n*TOTAL: $${formatPrice(totalFinal)}*\n`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Si querés bloquear “domicilio” hasta tener costo, lo dejo opcional:
  const domicilioDisabled = deliveryCostLoading; // o: deliveryCostLoading && deliveryMethod === "domicilio"

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.open : ""}`}
      onClick={close}
      aria-hidden={!isOpen}
    >
      <div
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito"
      >
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h3 className={styles.title}>Tu Carrito</h3>
            <span className={styles.countBadge}>{itemsCount}</span>
          </div>

          <button
            className={styles.closeBtn}
            onClick={close}
            aria-label="Cerrar carrito"
          >
            ✕
          </button>
        </div>

        {/* SCROLL */}
        <div className={styles.contentScroll}>
          {/* LISTA */}
          <div className={styles.items}>
            {cart.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>Tu carrito está vacío</p>
                <p className={styles.emptySub}>
                  Sumá productos y armamos tu pedido 😊
                </p>
              </div>
            ) : (
              cart.map((item) => {
                const img = item.image || item.imagen || GENERIC_IMG;
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
                          <span className={styles.unitPrice}>
                            ${formatPrice(unit)}
                          </span>
                          <span className={styles.dot}>•</span>
                          <span className={styles.lineTotal}>
                            Total: ${formatPrice(lineTotal)}
                          </span>
                        </div>

                        <div className={styles.controls}>
                          <button
                            className={styles.qtyBtn}
                            onClick={() => decreaseQty(item.slug)}
                            aria-label="Restar"
                          >
                            −
                          </button>

                          <span className={styles.qty}>{qty}</span>

                          <button
                            className={styles.qtyBtn}
                            onClick={() => addToCart(item)}
                            aria-label="Sumar"
                          >
                            +
                          </button>

                          <button
                            className={styles.removeBtn}
                            onClick={() => removeFromCart(item.slug)}
                            aria-label="Eliminar"
                            title="Eliminar"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ENTREGA */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Método de entrega</div>

            <div className={styles.deliveryOptions}>
              <label
                className={`${styles.option} ${deliveryMethod === "retiro" ? styles.optionActive : ""
                  }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryMethod === "retiro"}
                  onChange={() => setDeliveryMethod("retiro")}
                />
                <div className={styles.optionText}>
                  <div className={styles.optionMain}>Retiro en el local</div>
                  <div className={styles.optionSub}>Sin costo</div>
                </div>
              </label>

              <label
                className={`${styles.option} ${deliveryMethod === "domicilio" ? styles.optionActive : ""
                  }`}
                style={domicilioDisabled ? { opacity: 0.7 } : undefined}
                title={
                  domicilioDisabled
                    ? "Cargando costo de envío..."
                    : undefined
                }
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryMethod === "domicilio"}
                  onChange={() => setDeliveryMethod("domicilio")}
                  disabled={domicilioDisabled}
                />
                <div className={styles.optionText}>
                  <div className={styles.optionMain}>Envío a domicilio</div>
                  <div className={styles.optionSub}>
                    {deliveryCostLoading
                      ? "Cargando..."
                      : `+ $${formatPrice(deliveryCost)}`}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* FORM DOMICILIO */}
          {deliveryMethod === "domicilio" && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Datos de entrega</div>

              <div className={styles.formBox}>
                <label className={styles.label}>Dirección</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ej: Urquiza 1234"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />

                <label className={styles.label}>Notas</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Ej: Casa azul, timbre roto…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* MAPA */}
          {deliveryMethod === "retiro" && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Retiro en el local</div>
              <p className={styles.localAddress}>
                Antártida Argentina 850 – Chajarí, Entre Ríos
              </p>

              <iframe
                className={styles.map}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d342.7430261060059!2d-58.021625!3d-30.7537204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b1630c78f92f3f%3A0xf9fa5f1c78a96b27!2sAnt%C3%A1rtida%20Argentina%20850%2C%20Chajar%C3%AD%2C%20Entre%20R%C3%ADos!5e0!3m2!1ses-419!2sar!4v1700000000000!5m2!1ses-419!2sar"
                allowFullScreen=""
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <strong>${formatPrice(totalPrice)}</strong>
            </div>

            <div className={styles.totalRow}>
              <span>Envío</span>
              <strong>${formatPrice(costoEnvio)}</strong>
            </div>

            <div className={styles.totalRowFinal}>
              <span>Total</span>
              <strong>${formatPrice(totalFinal)}</strong>
            </div>
          </div>

          <button
            className={styles.checkoutBtn}
            onClick={sendToWhatsApp}
            disabled={cart.length === 0}
            title={
              cart.length === 0
                ? "Agregá productos al carrito"
                : "Finalizar por WhatsApp"
            }
          >
            Finalizar compra vía WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
