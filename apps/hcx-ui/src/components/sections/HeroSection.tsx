import { Button } from '@/components/ui/button';

const HeroSection = () => (
  <section className="bg-gradient-to-b from-white to-hcx-50 border-b">
    <div className="container px-4 py-16 md:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
          Simplify HCX Integration
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          A comprehensive toolkit for testing, validating and integrating with the Health Claims
          Exchange (HCX) framework under Ayushman Bharat Digital Mission.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button className="bg-hcx-600 hover:bg-hcx-700 text-white">Get Started</Button>
          <Button variant="outline">View Documentation</Button>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
