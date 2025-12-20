export const dynamic = "force-dynamic";
export const revalidate = 0;

import ProductosRootClient from "./ProductosRootClient";

export default function Page() {
  return (
    <div className="container mt-5">
      <ProductosRootClient />
    </div>
  );
}
