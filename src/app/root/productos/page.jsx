import { Suspense } from "react";
import ProductosRootClient from "./ProductosRootClient";

export const dynamic = "force-dynamic";

export default function Page() {
    return (
        <Suspense fallback={<p>Cargando...</p>}>
            <ProductosRootClient />
        </Suspense>
    );
}
