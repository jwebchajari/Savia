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

    const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("🔥 AuthContext MONTADO");
            console.log("🔥 ENV UID:", ADMIN_UID);
            console.log("🔥 USER UID:", currentUser?.uid);

            setUser(currentUser);

            if (currentUser && currentUser.uid === ADMIN_UID) {
                console.log("🔥 ADMIN DETECTADO: TRUE");
                setIsAdmin(true);
            } else {
                console.log("🔥 ADMIN DETECTADO: FALSE");
                setIsAdmin(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [ADMIN_UID]);

    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{ user, isAdmin, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
