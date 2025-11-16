"use client";

import { useCart } from "@/context/CartContext";
import styles from "./CartDrawer.module.css";
import { useState } from "react";

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

    const costoEnvio = deliveryMethod === "domicilio" ? 800 : 0;
    const totalFinal = totalPrice + costoEnvio;

    /* --------------------------------------
       ENVIAR A WHATSAPP
    -------------------------------------- */
    const sendToWhatsApp = () => {
        const phone = "5493412275598";

        let message = `🛒 *Nuevo pedido desde Savia*\n\n`;

        message += `*Método de entrega:* ${
            deliveryMethod === "domicilio" ? "Envío a domicilio" : "Retiro en el local"
        }\n`;

        if (deliveryMethod === "domicilio") {
            message += `📍 *Dirección:* ${address || "No indicada"}\n`;
        }

        if (notes) {
            message += `📝 *Notas:* ${notes}\n`;
        }

        message += `\n*Productos:*\n`;

        cart.forEach((item) => {
            message += `• ${item.name} x${item.quantity} — $${item.price * item.quantity}\n`;
        });

        message += `\nSubtotal: $${totalPrice}`;
        if (deliveryMethod === "domicilio") {
            message += `\nEnvío: $${costoEnvio}`;
        }
        message += `\n\n*TOTAL: $${totalFinal}*\n`;

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    };

    return (
        <div
            className={`${styles.overlay} ${isOpen ? styles.open : ""}`}
            onClick={close}
        >
            <div
                className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className={styles.header}>
                    <h3>Tu Carrito</h3>
                    <button className={styles.closeBtn} onClick={close}>
                        ✕
                    </button>
                </div>

                {/* 🔥 ZONA SCROLLABLE */}
                <div className={styles.contentScroll}>
                    {/* LISTA DE PRODUCTOS */}
                    <div className={styles.items}>
                        {cart.length === 0 ? (
                            <p className={styles.empty}>El carrito está vacío.</p>
                        ) : (
                            cart.map((item) => (
                                <div key={item.slug} className={styles.itemCard}>
                                    <div className={styles.info}>
                                        <strong>{item.name}</strong>
                                        <span>${item.price}</span>
                                    </div>

                                    <div className={styles.controls}>
                                        <button onClick={() => decreaseQty(item.slug)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => addToCart(item)}>+</button>
                                    </div>

                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => removeFromCart(item.slug)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* MÉTODO DE ENTREGA */}
                    <div className={styles.deliveryBox}>
                        <label className={styles.deliveryTitle}>Método de entrega:</label>

                        <div className={styles.deliveryOptions}>
                            <label className={styles.option}>
                                <input
                                    type="radio"
                                    name="delivery"
                                    checked={deliveryMethod === "retiro"}
                                    onChange={() => setDeliveryMethod("retiro")}
                                />
                                <span>Retiro en el local</span>
                            </label>

                            <label className={styles.option}>
                                <input
                                    type="radio"
                                    name="delivery"
                                    checked={deliveryMethod === "domicilio"}
                                    onChange={() => setDeliveryMethod("domicilio")}
                                />
                                <span>Envío a domicilio (+$800)</span>
                            </label>
                        </div>
                    </div>

                    {/* FORM DOMICILIO */}
                    {deliveryMethod === "domicilio" && (
                        <div className={styles.formBox}>
                            <label>Dirección de entrega:</label>
                            <input
                                type="text"
                                placeholder="Ej: Urquiza 1234"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />

                            <label>Notas para el repartidor:</label>
                            <textarea
                                placeholder="Ej: Casa azul, timbre roto…"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            ></textarea>
                        </div>
                    )}

                    {/* MAPA */}
                    {deliveryMethod === "retiro" && (
                        <div className={styles.mapBox}>
                            <p className={styles.localLabel}>Retiro en el local:</p>
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
                    <div className={styles.total}>
                        <span>Total:</span>
                        <strong>${totalFinal}</strong>
                    </div>

                    <button className={styles.checkoutBtn} onClick={sendToWhatsApp}>
                        Finalizar compra vía WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
}
