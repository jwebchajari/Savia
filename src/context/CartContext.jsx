"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [deliveryMethod, setDeliveryMethod] = useState("retiro");
    // retiro = por defecto

    /* -------------------------------------------
       CARGAR LOCALSTORAGE AL INICIAR
    -------------------------------------------- */
    useEffect(() => {
        const savedCart = localStorage.getItem("savia-cart");
        const savedMethod = localStorage.getItem("savia-delivery");

        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedMethod) setDeliveryMethod(savedMethod);
    }, []);

    /* -------------------------------------------
       GUARDAR LOCALSTORAGE CUANDO CAMBIA EL CARRITO
    -------------------------------------------- */
    useEffect(() => {
        localStorage.setItem("savia-cart", JSON.stringify(cart));
    }, [cart]);

    /* -------------------------------------------
       GUARDAR MÉTODO DE ENTREGA
    -------------------------------------------- */
    useEffect(() => {
        localStorage.setItem("savia-delivery", deliveryMethod);
    }, [deliveryMethod]);


    /* -------------------------------------------
       AGREGAR PRODUCTO
    -------------------------------------------- */
    function addToCart(product) {
        setCart((prev) => {
            const exists = prev.find((p) => p.slug === product.slug);

            if (exists) {
                return prev.map((p) =>
                    p.slug === product.slug
                        ? { ...p, quantity: p.quantity + 1 }
                        : p
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
                .map((p) =>
                    p.slug === slug ? { ...p, quantity: p.quantity - 1 } : p
                )
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
    }

    /* -------------------------------------------
       CANTIDAD TOTAL DE PRODUCTOS
    -------------------------------------------- */
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    /* -------------------------------------------
       TOTAL A PAGAR
    -------------------------------------------- */
    const totalPrice = cart.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
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
