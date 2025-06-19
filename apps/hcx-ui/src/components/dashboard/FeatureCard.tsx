import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  buttonText: string;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  href,
  buttonText,
}: FeatureCardProps) {
  return (
    <Card className="flex flex-col h-full transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <div className="p-2 w-12 h-12 rounded-lg bg-hcx-100 flex items-center justify-center mb-2">
          <Icon className="h-6 w-6 text-hcx-600" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">{/* Content can be added here if needed */}</CardContent>
      <CardFooter>
        <Link to={href} className="w-full">
          <Button variant="outline" className="w-full">
            {buttonText}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default FeatureCard;
