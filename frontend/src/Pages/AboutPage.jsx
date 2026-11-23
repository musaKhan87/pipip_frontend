import Header from "../components/Header";
import Footer from "../components/Footer";
import About from "../components/About";
import FAQ from "../components/FAQ";
import ScrollToTop from "../components/ScrollToTop";
import MobileBottomNav from "../components/MobileBottomNav";
import useSEO from "../hooks/useSEO";

const AboutPage = () => {
  useSEO({
    title: "About Us | Pipip Services - Self-Drive Two Wheeler Rental",
    description: "Learn more about Pipip Services, trusted self-drive bike and scooty rental service. Transparent ₹2,000 refundable security deposit, verified RTO papers, and complimentary sanitized helmet.",
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-0">
      <ScrollToTop />
      <Header />
      <main className="pt-20 md:pt-24">
        <About />
        <FAQ />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default AboutPage;
