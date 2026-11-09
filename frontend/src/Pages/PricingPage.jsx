import Header from "../components/Header";
import Footer from "../components/Footer";
import Pricing from "../components/Pricing";
import ScrollToTop from "../components/ScrollToTop";
import useSEO from "../hooks/useSEO";
const PricingPage = () => {
  useSEO({
    title: "Pricing | Pipip Services - Self Drive Bike & Scooter Rental Rates in Mumbai & Surat",
    description: "Check transparent bike and scooty rental rates in Mumbai and Surat. Rent daily, weekly, or monthly with zero hidden charges.",
  });
  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <Header />
      <main className="pt-24">
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};
export default PricingPage;