import Navbar from "@/_components/Navbar/Navbar";
import Banner from "@/_components/Banner/Banner";
import CategoryProducts from "@/_components/productosporcategoria/CategoryProducts";
import RecommendedProducts from "@/_components/RecommendedProducts/RecommendedProducts";
import Footer from "@/_components/Footer/Footer";

export default async function CategoriaPage({ params }) {
    const { id } = await params;

    return (
        <>
            <Navbar />
            <Banner />
            <CategoryProducts slug={id} />
            <RecommendedProducts limit={10} title="Te puede interesar" />
            <Footer/>
        </>
    );
}
