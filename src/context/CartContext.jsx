"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext();

const CART_KEY = "savia-cart";
const DELIVERY_KEY = "savia-delivery";
const TTL_MS = 3 * 60 * 60 * 1000; // 3 horas

function safeParse(json, fallback) {
    try {
        return JSON.parse(json);
    } catch {
        return fallback;
    }
}

function loadCartWithTTL() {
    // evita SSR
    if (typeof window === "undefined") return [];

    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];

    const parsed = safeParse(raw, null);

    // Soporta el formato viejo (array directo)
    if (Array.isArray(parsed)) return parsed;

    // Nuevo formato: { items, expiresAt }
    const items = parsed?.items;
    const expiresAt = parsed?.expiresAt;

    if (!Array.isArray(items) || typeof expiresAt !== "number") {
        // storage corrupto o formato raro → limpialo
        localStorage.removeItem(CART_KEY);
        return [];
    }

    if (Date.now() > expiresAt) {
        localStorage.removeItem(CART_KEY);
        return [];
    }

    return items;
}

export function CartProvider({ children }) {
    // ✅ init desde storage (evita “parpadeo” de carrito vacío)
    const [cart, setCart] = useState(() => loadCartWithTTL());

    const [deliveryMethod, setDeliveryMethod] = useState("retiro");

    /* -------------------------------------------
       CARGAR MÉTODO ENTREGA
    -------------------------------------------- */
    useEffect(() => {
        if (typeof window === "undefined") return;

        const savedMethod = localStorage.getItem(DELIVERY_KEY);
        if (savedMethod) setDeliveryMethod(savedMethod);
    }, []);

    /* -------------------------------------------
       GUARDAR CARRITO CON TTL (3 horas)
    -------------------------------------------- */
    useEffect(() => {
        if (typeof window === "undefined") return;

        const payload = {
            items: cart,
            expiresAt: Date.now() + TTL_MS,
        };

        localStorage.setItem(CART_KEY, JSON.stringify(payload));
    }, [cart]);

    /* -------------------------------------------
       GUARDAR MÉTODO DE ENTREGA
    -------------------------------------------- */
    useEffect(() => {
        if (typeof window === "undefined") return;
        localStorage.setItem(DELIVERY_KEY, deliveryMethod);
    }, [deliveryMethod]);

    /* -------------------------------------------
       AGREGAR PRODUCTO
    -------------------------------------------- */
    function addToCart(product) {
        setCart((prev) => {
            const exists = prev.find((p) => p.slug === product.slug);

            if (exists) {
                return prev.map((p) =>
                    p.slug === product.slug ? { ...p, quantity: p.quantity + 1 } : p
                );
            }

            return [...prev, { ...product, quantity: 1 }];
        });
    }

    /* -------------------------------------------
       QUITAR UNA UNIDAD
    -------------------------------------------- */
    function decreaseQty(slug) {
        setCart((prev) =>
            prev
                .map((p) => (p.slug === slug ? { ...p, quantity: p.quantity - 1 } : p))
                .filter((p) => p.quantity > 0)
        );
    }

    /* -------------------------------------------
       ELIMINAR UN PRODUCTO COMPLETO
    -------------------------------------------- */
    function removeFromCart(slug) {
        setCart((prev) => prev.filter((item) => item.slug !== slug));
    }

    /* -------------------------------------------
       VACIAR CARRITO
    -------------------------------------------- */
    function clearCart() {
        setCart([]);
        if (typeof window !== "undefined") {
            localStorage.removeItem(CART_KEY);
        }
    }

    /* -------------------------------------------
       CANTIDAD TOTAL DE PRODUCTOS
    -------------------------------------------- */
    const totalItems = useMemo(
        () => cart.reduce((sum, item) => sum + (item.quantity || 0), 0),
        [cart]
    );

    /* -------------------------------------------
       TOTAL A PAGAR
    -------------------------------------------- */
    const totalPrice = useMemo(
        () => cart.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0),
        [cart]
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                decreaseQty,
                removeFromCart,
                clearCart,
                totalItems,
                totalPrice,
                deliveryMethod,
                setDeliveryMethod,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
