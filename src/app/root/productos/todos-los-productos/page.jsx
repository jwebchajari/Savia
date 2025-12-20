"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import ProductosRootClient from "./ProductosRootClient";

export default function Page() {
    return (
        <div className="container mt-5">
            <ProductosRootClient />
        </div>
    );
}
