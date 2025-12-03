"use client";

import { useEffect, useState } from "react";
import NavbarRoot from "@/_components/Navbar/NavbarRoot";
import { getLocalData, updateLocalData } from "@/services/localService";

const DIAS = [
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
    "domingo",
];

export default function DatosComerciales() {
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        const data = await getLocalData();
        setForm(data);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    function update(path, value) {
        setForm((prev) => {
            const copy = structuredClone(prev);
            const keys = path.split(".");
            let p = copy;

            while (keys.length > 1) {
                p = p[keys.shift()];
            }
            p[keys[0]] = value;

            return copy;
        });
    }

    async function guardar() {
        await updateLocalData(form);
        alert("Datos guardados correctamente");
        load();
    }

    if (loading || !form) return <p>Cargando...</p>;

    return (
        <>
            <NavbarRoot />

            <div className="container py-5" style={{ marginTop: 90, maxWidth: 900 }}>
                <h1 className="fw-bold mb-4">Datos Comerciales</h1>

                {/* --- Datos Básicos --- */}
                <div className="card p-4 shadow-sm mb-4">
                    <h3 className="mb-3">Información del Local</h3>

                    <label className="fw-bold">Dirección</label>
                    <input
                        className="form-control mb-3"
                        value={form.direccion}
                        onChange={(e) => update("direccion", e.target.value)}
                    />

                    <label className="fw-bold">Costo de delivery</label>
                    <input
                        type="number"
                        className="form-control mb-3"
                        value={form.delivery}
                        onChange={(e) => update("delivery", Number(e.target.value))}
                    />
                </div>

                {/* --- Redes Sociales --- */}
                <div className="card p-4 shadow-sm mb-4">
                    <h3 className="mb-3">Redes Sociales</h3>

                    {Object.keys(form.redes).map((r) => (
                        <div className="mb-3" key={r}>
                            <label className="fw-bold" style={{ textTransform: "capitalize" }}>
                                {r}
                            </label>
                            <input
                                className="form-control"
                                value={form.redes[r]}
                                onChange={(e) => update(`redes.${r}`, e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                {/* --- Horarios --- */}
                <div className="card p-4 shadow-sm mb-4">
                    <h3 className="mb-3">Horarios</h3>

                    {DIAS.map((dia) => (
                        <div key={dia} className="mb-4 p-3 border rounded">
                            <h5 style={{ textTransform: "capitalize" }}>{dia}</h5>

                            <label className="d-flex align-items-center gap-2 mb-3">
                                <input
                                    type="checkbox"
                                    checked={form.horarios[dia].cerrado}
                                    onChange={() =>
                                        update(
                                            `horarios.${dia}.cerrado`,
                                            !form.horarios[dia].cerrado
                                        )
                                    }
                                />
                                Cerrado todo el día
                            </label>

                            {!form.horarios[dia].cerrado && (
                                <>
                                    {/* Franja 1 */}
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <label className="fw-bold">Franja 1:</label>
                                        <input
                                            type="time"
                                            value={form.horarios[dia].franja1.desde}
                                            onChange={(e) =>
                                                update(
                                                    `horarios.${dia}.franja1.desde`,
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <span>a</span>
                                        <input
                                            type="time"
                                            value={form.horarios[dia].franja1.hasta}
                                            onChange={(e) =>
                                                update(
                                                    `horarios.${dia}.franja1.hasta`,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Franja 2 */}
                                    <div className="d-flex align-items-center gap-2">
                                        <label className="fw-bold">Franja 2:</label>
                                        <input
                                            type="time"
                                            value={form.horarios[dia].franja2.desde}
                                            onChange={(e) =>
                                                update(
                                                    `horarios.${dia}.franja2.desde`,
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <span>a</span>
                                        <input
                                            type="time"
                                            value={form.horarios[dia].franja2.hasta}
                                            onChange={(e) =>
                                                update(
                                                    `horarios.${dia}.franja2.hasta`,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* --- Guardar --- */}
                <button className="btn btn-savia w-100 py-3" onClick={guardar}>
                    Guardar cambios
                </button>
            </div>
        </>
    );
}
