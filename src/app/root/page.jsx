"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/_components/Navbar/Navbar";

const ROOT_EMAIL = process.env.NEXT_PUBLIC_ROOT_EMAIL;

export default function LoginPage() {
    const router = useRouter();
    const { user, isAdmin } = useAuth();

    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [error, setError] = useState("");

    // Redirect automático si ya es admin
    useEffect(() => {
        if (user && isAdmin) {
            router.replace("/root");
        }
    }, [user, isAdmin, router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (email !== ROOT_EMAIL) {
            setError("Usuario no autorizado.");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, pass);
            // NO redirigir desde acá — lo hace el AuthContext automáticamente
        } catch (err) {
            console.error(err);
            setError("Credenciales incorrectas.");
        }
    };

    return (
        <>
            <Navbar />
            <main className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-6 col-lg-4">
                        <h1 className="mb-4 text-center">Acceso Root</h1>

                        <form onSubmit={handleLogin} className="card p-4 shadow-sm border-0">
                            <div className="mb-3">
                                <label className="form-label">Correo</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Contraseña</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={pass}
                                    onChange={(e) => setPass(e.target.value)}
                                    required
                                />
                            </div>

                            {error && <div className="alert alert-danger py-2">{error}</div>}

                            <button type="submit" className="btn btn-savia w-100 mt-2">
                                Ingresar
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}
