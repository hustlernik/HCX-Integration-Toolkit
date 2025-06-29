import StatsCard from '@/components/dashboard/StatsCard';
import { Activity, FileJson, Code2, Laptop, LucideIcon } from 'lucide-react';

interface StatsData {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
}

interface StatsSectionProps {
  stats?: StatsData[];
}

const defaultStats: StatsData[] = [
  {
    title: 'API Endpoints',
    value: '12',
    description: 'Available in sandbox',
    icon: Activity,
    trend: { value: 3, isPositive: true },
  },
  {
    title: 'FHIR Resources',
    value: '45',
    description: 'Fully supported',
    icon: FileJson,
    trend: { value: 8, isPositive: true },
  },
  {
    title: 'Active Developers',
    value: '127',
    description: 'Using the toolkit',
    icon: Code2,
    trend: { value: 3, isPositive: true },
  },
  {
    title: 'Test Payloads',
    value: '23',
    description: 'Pre-built examples',
    icon: Laptop,
    trend: { value: 3, isPositive: true },
  },
];

const StatsSection = ({ stats = defaultStats }: StatsSectionProps) => (
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
