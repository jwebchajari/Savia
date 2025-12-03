import Navbar from "@/_components/Navbar/Navbar";
import Banner from "@/_components/Banner/Banner";
import CategoryProducts from "@/_components/productosporcategoria/CategoryProducts";

export default function CategoriaPage({ params }) {

    return (
        <>
            <Navbar />
            <Banner />

            {/* 👇 AHORA SÍ PASA EL SLUG CORRECTO */}
            <CategoryProducts slug={params.id} />
        </>
    );
}
