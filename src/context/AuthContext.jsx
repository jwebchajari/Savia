"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const [showExpiredModal, setShowExpiredModal] = useState(false);

    const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

    // Control de expiración de sesión (8 horas)
    useEffect(() => {
        if (!user) return;

        const loginTime = localStorage.getItem("loginTime");
        if (!loginTime) return;

        const hoursSinceLogin =
            (Date.now() - parseInt(loginTime)) / 1000 / 60 / 60;

        if (hoursSinceLogin >= 8) {
            console.log("⏳ Sesión expirada. Cerrando sesión...");
            setShowExpiredModal(true); // Mostrar modal
        }
    }, [user]);

    // Firebase Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);

            if (currentUser && currentUser.uid === ADMIN_UID) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [ADMIN_UID]);

    const logout = () => {
        localStorage.removeItem("loginTime");
        signOut(auth);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAdmin,
                loading,
                logout,
                showExpiredModal,
                setShowExpiredModal
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
