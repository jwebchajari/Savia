import * as XLSX from "xlsx";

/**
 * Parsea un archivo Excel y devuelve los productos listos para preview.
 * Columnas mínimas: nombre, descripcion, precio
 */
export const parseExcelFile = async (file) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				const data = new Uint8Array(e.target.result);
				const workbook = XLSX.read(data, { type: "array" });

				// Primera hoja
				const sheetName = workbook.SheetNames[0];
				const sheet = workbook.Sheets[sheetName];

				// JSON
				const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

				if (!json.length) {
					return reject(
						new Error("El archivo está vacío o sin datos válidos.")
					);
				}

				const required = ["nombre", "descripcion", "precio"];
				const columns = Object.keys(json[0] || {});
				const missingCols = required.filter(
					(col) => !columns.includes(col)
				);

				if (missingCols.length > 0) {
					return reject(
						new Error(
							`El archivo Excel debe contener estas columnas: ${required.join(
								", "
							)}. Faltan: ${missingCols.join(", ")}`
						)
					);
				}

				const products = json
					.map((row) => {
						if (
							!row.nombre &&
							!row.descripcion &&
							!row.precio &&
							!row.categoria
						) {
							return null;
						}

						const precio = Number(row.precio);
						if (isNaN(precio) || precio <= 0) {
							return null;
						}

						return {
							nombre: row.nombre || "",
							descripcion: row.descripcion || "",
							categoria: row.categoria || "",

							precio: Number(row.precio) || 0,
							precioOferta:
								row.precioOferta !== undefined &&
								row.precioOferta !== "" &&
								!isNaN(Number(row.precioOferta))
									? Number(row.precioOferta)
									: null,

							imagen: row.imagen || "",
							disponible:
								typeof row.disponible === "boolean"
									? row.disponible
									: true,

							ofertaGeneral:
								typeof row.ofertaGeneral === "boolean"
									? row.ofertaGeneral
									: false,

							ofertaSemana:
								typeof row.ofertaSemana === "boolean"
									? row.ofertaSemana
									: false,
						};
					})
					.filter((p) => p !== null);

				resolve(products);
			} catch (error) {
				reject(error);
			}
		};

		reader.onerror = () =>
			reject(new Error("Error al leer el archivo Excel."));

		reader.readAsArrayBuffer(file);
	});
};
