import { Header, Footer } from "../components/common";
import Hero from "../components/common/Hero";
import Categories from "../components/product/Categories";
import FeaturedProducts from "../components/product/FeaturedProducts";
import HowItWorks from "../components/common/HowItWorks";
import Testimonials from "../components/common/Testimonials";

export default function Home() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#F7F1E8', color: '#3F2E23' }}>
      <Header />
      <main className="container mx-auto px-6 py-12">
        <Hero />
        <Categories />
        <FeaturedProducts />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
