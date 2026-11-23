import Header from "../components/Header";
import Footer from "../components/Footer";
import Pricing from "../components/Pricing";
import ScrollToTop from "../components/ScrollToTop";
import MobileBottomNav from "../components/MobileBottomNav";
import useSEO from "../hooks/useSEO";

const PricingPage = () => {
  useSEO({
    title: "Pricing | Pipip Services - Self Drive Bike & Scooter Rental Rates",
    description: "Check transparent bike and scooty rental rates. Rent hourly, daily, or weekly with ₹200 token lock and 100% refundable security deposit.",
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-0">
      <ScrollToTop />
      <Header />
      <main className="pt-20 md:pt-24">
        <Pricing />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default PricingPage;
