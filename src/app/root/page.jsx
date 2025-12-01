import { Suspense } from "react";
import ProductosRootClient from "./ProductosRootClient";

// 🔥 DESACTIVA COMPLETAMENTE EL PRERENDER / SSG / SSR
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default function Page() {
    return (
        <Suspense fallback={<p>Cargando...</p>}>
            <ProductosRootClient />
        </Suspense>
    );
}
