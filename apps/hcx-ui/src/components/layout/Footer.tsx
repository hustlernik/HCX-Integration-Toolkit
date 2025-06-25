const Footer = () => (
  <footer className="border-t py-6">
    <div className="container px-4">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-sm text-gray-600">
            © 2025 HCX Integration Toolkit | National Health Authority
          </p>
        </div>
        <div className="flex gap-6">
          <a href="/terms" className="text-sm text-gray-600 hover:text-hcx-600">
            Terms
          </a>
          <a href="/privacy" className="text-sm text-gray-600 hover:text-hcx-600">
            Privacy
          </a>
          <a href="/contact" className="text-sm text-gray-600 hover:text-hcx-600">
            Contact
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
