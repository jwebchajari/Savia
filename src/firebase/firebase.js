import { initializeApp, getApps } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

let analytics = null;

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Evita múltiples inicializaciones en Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Auth
export const auth = getAuth(app);

// Persistencia (OBLIGATORIO en Next o rompe credenciales)
if (typeof window !== "undefined") {
	setPersistence(auth, browserLocalPersistence);
}

// Firestore
export const db = getFirestore(app);

// Realtime DB
export const rtdb = getDatabase(app);

// Analytics sólo en el navegador
if (typeof window !== "undefined") {
	import("firebase/analytics").then(({ getAnalytics }) => {
		analytics = getAnalytics(app);
	});
}

export default app;
