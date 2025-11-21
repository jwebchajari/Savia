"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NavbarRoot from "@/_components/Navbar/NavbarRoot";
import { parseExcelFile } from "@/services/excelService";
import { createProduct } from "@/services/productsService";
import * as XLSX from "xlsx";

const CATEGORIES = [
    "Vegano",
    "Frutos secos",
    "Sin Lactosa",
    "Sin TACC",
    "Sin Azúcar",
    "Yuyitos",
    "Condimentos",
    "Suplementos vitamínicos",
    "Suplementos dietarios",
];

// Generar plantilla básica
const downloadBasicTemplate = () => {
    const wb = XLSX.utils.book_new();

    const wsData = [
        ["nombre", "descripcion", "precio"],
        ["Ejemplo producto", "Descripción ejemplo", 100],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");

    XLSX.writeFile(wb, "plantillaProductos.xlsx");
};

// Generar plantilla avanzada
const downloadAdvancedTemplate = () => {
    const wb = XLSX.utils.book_new();

    const ws = XLSX.utils.aoa_to_sheet([
        ["nombre", "descripcion", "precio"],
        ["Ejemplo producto", "Descripción del producto", 100],
    ]);

    ws["!cols"] = [
        { wch: 25 },
        { wch: 40 },
        { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Productos");

    const instrucciones = [
        ["Instrucciones para importar productos"],
        [],
        ["1. Complete las columnas obligatorias:"],
        ["   - nombre"],
        ["   - precio (número mayor a 0)"],
        [],
        ["2. descripcion es opcional."],
        ["3. No agregue columnas adicionales."],
        ["4. Luego importe el archivo en el panel de administración."],
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(instrucciones);
    XLSX.utils.book_append_sheet(wb, ws2, "Instrucciones");

    XLSX.writeFile(wb, "plantillaProductos_avanzada.xlsx");
};

export default function ImportarProductosPage() {
    const router = useRouter();
    const { user, isAdmin, loading } = useAuth();

    const [excelRows, setExcelRows] = useState([]);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState("");

    if (loading) return null;
    if (!user || !isAdmin) {
        router.replace("/login");
        return null;
    }

    // Leer archivo Excel
    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError("");
        setExcelRows([]);

        try {
            const rows = await parseExcelFile(file);

            const rowsWithCategories = rows.map((row) => ({
                ...row,
                categoria: row.categoria || "",
            }));

            setExcelRows(rowsWithCategories);
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    // Editar campos en preview
    const updateRow = (index, key, value) => {
        setExcelRows((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))
        );
    };

    // Importar todo
    const handleImport = async () => {
        setError("");
        setImporting(true);

        try {
            for (const row of excelRows) {
                if (!row.nombre || !row.precio || !row.categoria) {
                    throw new Error("Hay filas incompletas. Revisá la preview.");
                }

                await createProduct(row);
            }

            alert("Productos importados correctamente.");
            router.push("/root/productos");
        } catch (err) {
            console.error(err);
            setError(err.message);
            setImporting(false);
        }
    };

    return (
        <>
            <NavbarRoot />
            <main className="container py-5" style={{ marginTop: 80 }}>
                <h1 className="fw-bold mb-4">Importar productos desde Excel</h1>

                <div className="card p-4 shadow-sm mb-4">
                    <label className="form-label fw-bold">Seleccionar archivo Excel</label>
                    <input
                        type="file"
                        accept=".xlsx"
                        className="form-control"
                        onChange={handleFile}
                    />

                    <div className="d-flex flex-column flex-md-row gap-2 mt-3">
                        <button
                            className="btn btn-outline-primary"
                            onClick={downloadBasicTemplate}
                        >
                            Descargar plantilla básica
                        </button>

                        <button
                            className="btn btn-outline-success"
                            onClick={downloadAdvancedTemplate}
                        >
                            Descargar plantilla avanzada
                        </button>
                    </div>

                    {error && (
                        <div className="alert alert-danger mt-3">{error}</div>
                    )}
                </div>

                {/* PREVIEW */}
                {excelRows.length > 0 && (
                    <>
                        <h3 className="mb-3">Preview (editable)</h3>

                        <div className="table-responsive">
                            <table className="table table-bordered align-middle small">
                                <thead className="table-light">
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Descripción</th>
                                        <th>Precio</th>
                                        <th>Categoría (obligatoria)</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {excelRows.map((row, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input
                                                    className="form-control"
                                                    value={row.nombre}
                                                    onChange={(e) =>
                                                        updateRow(index, "nombre", e.target.value)
                                                    }
                                                />
                                            </td>

                                            <td>
                                                <input
                                                    className="form-control"
                                                    value={row.descripcion}
                                                    onChange={(e) =>
                                                        updateRow(index, "descripcion", e.target.value)
                                                    }
                                                />
                                            </td>

                                            <td>
                                                <input
                                                    className="form-control"
                                                    type="number"
                                                    value={row.precio}
                                                    onChange={(e) =>
                                                        updateRow(index, "precio", e.target.value)
                                                    }
                                                />
                                            </td>

                                            <td>
                                                <select
                                                    className="form-select"
                                                    value={row.categoria}
                                                    onChange={(e) =>
                                                        updateRow(index, "categoria", e.target.value)
                                                    }
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    {CATEGORIES.map((c) => (
                                                        <option key={c} value={c}>
                                                            {c}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            className="btn btn-savia mt-3 px-4 py-2"
                            disabled={importing}
                            onClick={handleImport}
                        >
                            {importing ? "Importando..." : "Importar todos"}
                        </button>
                    </>
                )}
            </main>
        </>
    );
}
