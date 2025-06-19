import StatsCard from '@/components/dashboard/StatsCard';
import { Activity, FileJson, Code2, Laptop } from 'lucide-react';

const stats = [
  {
    title: 'API Endpoints',
    value: '0',
    description: 'Available in sandbox',
    icon: Activity,
    trend: { value: 0, isPositive: true },
  },
  {
    title: 'FHIR Resources',
    value: '0',
    description: 'Fully supported',
    icon: FileJson,
    trend: { value: 0, isPositive: true },
  },
  {
    title: 'Active Developers',
    value: '0',
    description: 'Using the toolkit',
    icon: Code2,
  },
  {
    title: 'Test Payloads',
    value: '0',
    description: 'Pre-built examples',
    icon: Laptop,
  },
];

const StatsSection = () => (
  <section className="py-8 md:py-12">
    <div className="container px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
