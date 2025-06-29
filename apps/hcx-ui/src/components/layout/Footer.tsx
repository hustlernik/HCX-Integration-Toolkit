import React from 'react';
import { Link } from 'react-router-dom';

interface FooterLink {
  href: string;
  text: string;
}

const Footer = () => {
  const currentYear: number = new Date().getFullYear();

  const footerLinks: FooterLink[] = [
    { href: '/terms', text: 'Terms' },
    { href: '/privacy', text: 'Privacy' },
    { href: '/contact', text: 'Contact' },
  ];

  return (
    <footer className="border-t py-6">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">
              © {currentYear} HCX Integration Toolkit | National Health Authority
            </p>
          </div>
          <nav className="flex gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                {link.text}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
