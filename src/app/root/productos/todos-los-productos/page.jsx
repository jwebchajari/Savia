"use client";

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import ProductosRootClient from "./ProductosRootClient";

export default function Page() {
    const router = useRouter();

    return (
        <div className="container mt-5">
            <ProductosRootClient />
        </div>
    );
}
