import Banner from "@/_components/Banner/Banner";
import Categories from "@/_components/Categories/Categories";
import Allcategories from "@/_components/CategorySection/Allcategories";
import ContactSection from "@/_components/ContactSection/ContactSection";
import Footer from "@/_components/Footer/Footer";
import Navbar from "@/_components/Navbar/Navbar";
import WeeklyOffers from "../_components/Offers/WeeklyOffers";

export default function Home() {
  return (
    <>
      <Navbar />
      <Banner />
      <Categories />
      <WeeklyOffers />
      <Allcategories />
      <ContactSection />
      <Footer />
    </>
  );
}
