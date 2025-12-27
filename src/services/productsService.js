import { rtdb } from "@/firebase/firebase";
import { ref, push, set, get, update, remove } from "firebase/database";

const PRODUCTS_PATH = "products";

// Generar slug sin espacios ni tildes (por si te llega vacío)
function slugify(str) {
	return (str || "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "");
}

// Normaliza un objeto del RTDB
const mapProduct = (id, data) => ({
	id,
	nombre: data.nombre || "",
	descripcion: data.descripcion || "",
	categoriaNombre: data.categoriaNombre || data.categoria || "",
	categoriaSlug:
		data.categoriaSlug ||
		slugify(data.categoriaNombre || data.categoria || ""),
	precio:
		typeof data.precio === "number"
			? data.precio
			: Number(data.precio) || 0,
	precioOferta:
		typeof data.precioOferta === "number"
			? data.precioOferta
			: data.precioOferta != null && data.precioOferta !== ""
			? Number(data.precioOferta) || null
			: null,
	imagen: data.imagen || "",
	disponible: typeof data.disponible === "boolean" ? data.disponible : true,
	ofertaGeneral: !!data.ofertaGeneral,
	ofertaSemana: !!data.ofertaSemana,
	tipoVenta:
		data.tipoVenta === "u" || data.tipoVenta === "unidad" ? "u" : "kg", // ✅ CLAVE
	createdAt: data.createdAt ?? null,
	updatedAt: data.updatedAt ?? null,
});

// Obtiene todos los productos
export const getProducts = async () => {
	const productsRef = ref(rtdb, PRODUCTS_PATH);
	const snapshot = await get(productsRef);

	if (!snapshot.exists()) return [];

	const data = snapshot.val();

	return Object.entries(data)
		.map(([id, value]) => mapProduct(id, value))
		.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
};

// Obtiene un producto por ID
export const getProductById = async (id) => {
	const productRef = ref(rtdb, `${PRODUCTS_PATH}/${id}`);
	const snapshot = await get(productRef);

	if (!snapshot.exists()) return null;

	return mapProduct(id, snapshot.val());
};

// Crear producto con validación
export const createProduct = async (productData) => {
	const precio = Number(productData.precio);
	const precioOferta =
		productData.precioOferta !== "" && productData.precioOferta != null
			? Number(productData.precioOferta)
			: null;

	if (!Number.isFinite(precio) || precio <= 0) {
		throw new Error("El precio debe ser válido.");
	}

	if (
		precioOferta != null &&
		Number.isFinite(precioOferta) &&
		precioOferta >= precio
	) {
		throw new Error(
			"El precio de oferta no puede ser mayor o igual al precio normal."
		);
	}

	const productsRef = ref(rtdb, PRODUCTS_PATH);
	const newRef = push(productsRef);
	const id = newRef.key;

	const now = Date.now();

	const categoriaNombre =
		productData.categoriaNombre || productData.categoria || "";
	const categoriaSlug = productData.categoriaSlug || slugify(categoriaNombre);

	const tipoVentaRaw = (productData.tipoVenta ?? "kg")
		.toString()
		.toLowerCase();
	const tipoVenta =
		tipoVentaRaw === "u" || tipoVentaRaw === "unidad" ? "u" : "kg";

	const payload = {
		id,
		nombre: productData.nombre,
		descripcion: productData.descripcion || "",
		categoriaNombre,
		categoriaSlug,
		precio,
		precioOferta:
			precioOferta != null && Number.isFinite(precioOferta)
				? precioOferta
				: null,
		imagen: productData.imagen || "",
		disponible: !!productData.disponible,
		ofertaGeneral: !!productData.ofertaGeneral,
		ofertaSemana: !!productData.ofertaSemana,
		tipoVenta, // ✅ CLAVE
		createdAt: now,
		updatedAt: now,
	};

	await set(newRef, payload);
	return payload;
};

// Actualizar producto con validación
export const updateProduct = async (id, productData) => {
	const precio = Number(productData.precio);
	const precioOferta =
		productData.precioOferta !== "" && productData.precioOferta != null
			? Number(productData.precioOferta)
			: null;

	if (!Number.isFinite(precio) || precio <= 0) {
		throw new Error("El precio debe ser válido.");
	}

	if (
		precioOferta != null &&
		Number.isFinite(precioOferta) &&
		precioOferta >= precio
	) {
		throw new Error(
			"El precio de oferta no puede ser mayor o igual al precio normal."
		);
	}

	const productRef = ref(rtdb, `${PRODUCTS_PATH}/${id}`);
	const now = Date.now();

	const categoriaNombre =
		productData.categoriaNombre || productData.categoria || "";
	const categoriaSlug = productData.categoriaSlug || slugify(categoriaNombre);

	const tipoVentaRaw = (productData.tipoVenta ?? "kg")
		.toString()
		.toLowerCase();
	const tipoVenta =
		tipoVentaRaw === "u" || tipoVentaRaw === "unidad" ? "u" : "kg";

	const payload = {
		nombre: productData.nombre,
		descripcion: productData.descripcion || "",
		categoriaNombre,
		categoriaSlug,
		precio,
		precioOferta:
			precioOferta != null && Number.isFinite(precioOferta)
				? precioOferta
				: null,
		imagen: productData.imagen || "",
		disponible: !!productData.disponible,
		ofertaGeneral: !!productData.ofertaGeneral,
		ofertaSemana: !!productData.ofertaSemana,
		tipoVenta, // ✅ CLAVE
		updatedAt: now,
	};

	await update(productRef, payload);
};

// Eliminar producto
export const deleteProduct = async (id) => {
	const productRef = ref(rtdb, `${PRODUCTS_PATH}/${id}`);
	await remove(productRef);
};

// Ofertas generales
export const getGeneralOffers = async () => {
	const all = await getProducts();
	return all.filter((p) => p.ofertaGeneral && p.disponible);
};

// Ofertas de la semana
export const getWeeklyOffers = async () => {
	const all = await getProducts();
	return all.filter((p) => p.ofertaSemana && p.disponible);
};
