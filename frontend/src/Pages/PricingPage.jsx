import Header from "../components/Header";
import Footer from "../components/Footer";
import Pricing from "../components/Pricing";
import ScrollToTop from "../components/ScrollToTop";
import useSEO from "../hooks/useSEO";
const PricingPage = () => {
  useSEO({
    title: "Pricing | Pipip - Self Drive Bike & Scooter Rental Rates in Mumbai",
    description: "Check transparent bike rental rates in Mumbai. Rent scooters and bikes daily, weekly, or monthly with no hidden charges.",
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