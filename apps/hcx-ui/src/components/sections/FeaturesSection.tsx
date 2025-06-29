import FeatureCard from '@/components/dashboard/FeatureCard';
import {
  FileJson,
  FileSpreadsheet,
  Activity,
  Laptop,
  Search,
  GitMerge,
  LucideIcon,
} from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  buttonText: string;
}

interface FeaturesSectionProps {
  features?: Feature[];
}

const defaultFeatures: Feature[] = [
  {
    title: 'FHIR Bundle Validator',
    description: 'Validate and explore FHIR bundles with an interactive viewer',
    icon: FileJson,
    href: '/fhir-tools',
    buttonText: 'Try Validator',
  },
  {
    title: 'Excel to FHIR Converter',
    description: 'Convert Excel/PDF insurance plans to valid FHIR bundles',
    icon: FileSpreadsheet,
    href: '/converters',
    buttonText: 'Convert Files',
  },
  {
    title: 'API Test Suite',
    description: 'Test HCX API endpoints with different methods and parameters',
    icon: Activity,
    href: '/api-testing',
    buttonText: 'Test APIs',
  },
  {
    title: 'Provider Mock Server',
    description: 'Simulate provider-side interactions for testing',
    icon: Laptop,
    href: '/mock-servers',
    buttonText: 'Start Mock Server',
  },
  {
    title: 'Payer Reference App',
    description: 'End-to-end testing reference application for providers',
    icon: Search,
    href: '/payer-app',
    buttonText: 'View Reference App',
  },
  {
    title: 'Integration Libraries',
    description: 'Multi-language libraries for common FHIR operations',
    icon: GitMerge,
    href: '/libraries',
    buttonText: 'Explore Libraries',
  },
];

const FeaturesSection = ({ features = defaultFeatures }: FeaturesSectionProps) => (
  <section className="py-8 md:py-12">
    <div className="container px-4">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Everything You Need for HCX Integration
        </h2>
        <p className="text-gray-600">
          Comprehensive tools to accelerate your integration with the Health Claims Exchange
          framework
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
