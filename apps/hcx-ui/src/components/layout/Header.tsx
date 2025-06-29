import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, Github } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavItem {
  title: string;
  href: string;
}

interface HeaderProps {
  navItems?: NavItem[];
}

const defaultNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/' },
  { title: 'FHIR Tools', href: '/fhir-tools' },
  { title: 'API Testing', href: '/api-testing' },
  { title: 'Documentation', href: '/docs' },
];

const Header = ({ navItems = defaultNavItems }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleMobileMenuClose = (): void => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo/Brand - Using Link for internal navigation */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-lg sm:text-xl">HCX Integration Toolkit</span>
          </Link>
        </div>

        {/* Desktop Navigation - All internal links use Link component */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-sm font-medium transition-colors hover:text-hcx-600"
            >
              {item.title}
            </Link>
          ))}
          {/* External GitHub link uses regular anchor tag */}
          <a
            href="https://github.com/hustlernik/HCX-Integration-Toolkit/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center text-sm font-medium transition-colors hover:text-foreground/80"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
        </nav>

        {/* Mobile Menu */}
        <div className="flex md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {/* Mobile Navigation - All internal links use Link component */}
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={handleMobileMenuClose}
                    className="text-sm font-medium transition-colors hover:text-hcx-600 py-2"
                  >
                    {item.title}
                  </Link>
                ))}
                {/* External GitHub link uses regular anchor tag */}
                <a
                  href="https://github.com/hustlernik/HCX-Integration-Toolkit/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2 text-sm font-medium"
                >
                  <Github className="h-5 w-5" />
                  GitHub
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
