import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonHref?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

const HeroSection = ({
  title = 'Simplify HCX Integration',
  subtitle = 'A comprehensive toolkit for testing, validating and integrating with the Health Claims Exchange (HCX) framework under Ayushman Bharat Digital Mission.',
  primaryButtonText = 'Get Started',
  secondaryButtonText = 'View Documentation',
  primaryButtonHref,
  secondaryButtonHref,
  onPrimaryClick,
  onSecondaryClick,
}: HeroSectionProps) => (
  <section className="bg-gradient-to-b from-white to-hcx-50 border-b">
    <div className="container px-4 py-16 md:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">{subtitle}</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            className="bg-hcx-600 hover:bg-hcx-700 text-white"
            aria-label="Get started with HCX integration"
            onClick={onPrimaryClick}
            {...(primaryButtonHref && { asChild: true })}
          >
            {primaryButtonHref ? (
              <Link to={primaryButtonHref}>{primaryButtonText}</Link>
            ) : (
              primaryButtonText
            )}
          </Button>
          <Button
            variant="outline"
            aria-label="View HCX integration documentation"
            onClick={onSecondaryClick}
            {...(secondaryButtonHref && { asChild: true })}
          >
            {secondaryButtonHref ? (
              <Link to={secondaryButtonHref}>{secondaryButtonText}</Link>
            ) : (
              secondaryButtonText
            )}
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
