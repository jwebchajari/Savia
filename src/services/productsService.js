import { rtdb } from "@/firebase/firebase";
import { ref, push, set, get, update, remove } from "firebase/database";

const PRODUCTS_PATH = "products";

// Normaliza un objeto del RTDB
const mapProduct = (id, data) => ({
	id,
	nombre: data.nombre || "",
	descripcion: data.descripcion || "",
	categoria: data.categoria || "",
	precio: typeof data.precio === "number" ? data.precio : 0,
	precioOferta:
		typeof data.precioOferta === "number" ? data.precioOferta : null,
	imagen: data.imagen || "",
	disponible: data.disponible ?? true,
	ofertaGeneral: data.ofertaGeneral ?? false,
	ofertaSemana: data.ofertaSemana ?? false,
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
	if (
		productData.precioOferta &&
		Number(productData.precioOferta) >= Number(productData.precio)
	) {
		throw new Error(
			"El precio de oferta no puede ser mayor o igual al precio normal."
		);
	}

	const productsRef = ref(rtdb, PRODUCTS_PATH);
	const newRef = push(productsRef);
	const id = newRef.key;

	const now = Date.now();

	const payload = {
		id,
		nombre: productData.nombre,
		descripcion: productData.descripcion || "",
		categoria: productData.categoria || "",
		precio: Number(productData.precio),
		precioOferta:
			productData.precioOferta !== "" && productData.precioOferta != null
				? Number(productData.precioOferta)
				: null,
		imagen: productData.imagen || "",
		disponible: !!productData.disponible,
		ofertaGeneral: !!productData.ofertaGeneral,
		ofertaSemana: !!productData.ofertaSemana,
		createdAt: now,
		updatedAt: now,
	};

	await set(newRef, payload);
	return payload;
};

// Actualizar producto con validación
export const updateProduct = async (id, productData) => {
	if (
		productData.precioOferta &&
		Number(productData.precioOferta) >= Number(productData.precio)
	) {
		throw new Error(
			"El precio de oferta no puede ser mayor o igual al precio normal."
		);
	}

	const productRef = ref(rtdb, `${PRODUCTS_PATH}/${id}`);

	const now = Date.now();

	const payload = {
		nombre: productData.nombre,
		descripcion: productData.descripcion || "",
		categoria: productData.categoria || "",
		precio: Number(productData.precio),
		precioOferta:
			productData.precioOferta !== "" && productData.precioOferta != null
				? Number(productData.precioOferta)
				: null,
		imagen: productData.imagen || "",
		disponible: !!productData.disponible,
		ofertaGeneral: !!productData.ofertaGeneral,
		ofertaSemana: !!productData.ofertaSemana,
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
