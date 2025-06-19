import Header from '@/components/layout/Header';
import HeroSection from '@/components/sections/HeroSection';
import StatsSection from '@/components/sections/StatsSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import Footer from '@/components/layout/Footer';

const Index = () => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <main className="flex-1">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
    </main>
    <Footer />
  </div>
);

export default Index;
