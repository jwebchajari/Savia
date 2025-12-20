import Navbar from "@/_components/Navbar/Navbar";
import Banner from "@/_components/Banner/Banner";
import CategoryProducts from "@/_components/productosporcategoria/CategoryProducts";

export default async function CategoriaPage({ params }) {
    const { id } = await params; // ✅ params es Promise en tu setup

    return (
        <>
            <Navbar />
            <Banner />
            <CategoryProducts slug={id} />
        </>
    );
}
