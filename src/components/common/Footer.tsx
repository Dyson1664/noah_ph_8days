import { Link } from "react-router-dom";
import ibtLogo from "@/assets/ibt-logo.png";

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top */}
        <div className="grid gap-10 lg:grid-cols-3 items-start">
          {/* Logo Section */}
          <div className="lg:col-span-2">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6">
                <div className="text-primary text-2xl font-bold">Imagine beyond</div>
                <div className="text-lg tracking-wider">TRAVEL</div>
              </div>

              <img
                src={ibtLogo}
                alt="IBT Logo"
                className="w-96 sm:w-[28rem] lg:w-[32rem] h-auto max-w-full object-contain mx-auto"
              />
            </div>
          </div>

          {/* Help Column */}
          <div>
            <h4 className="font-semibold mb-6 text-primary">Help</h4>
            <div className="space-y-3 text-sm">
              <a
                href="https://www.imaginebeyondtravel.com/#/"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-primary transition-colors"
              >
                Main Website
              </a>

              <Link
                to="/about"
                className="block hover:text-primary transition-colors"
                onClick={() => window.scrollTo(0, 0)}
              >
                About Imagine Beyond Travel
              </Link>

              <Link
                to="/faqs"
                className="block hover:text-primary transition-colors"
                onClick={() => window.scrollTo(0, 0)}
              >
                FAQs
              </Link>

              <Link
                to="/terms"
                className="block hover:text-primary transition-colors"
                onClick={() => window.scrollTo(0, 0)}
              >
                Terms &amp; Conditions
              </Link>
              <Link
                to="/admin/login"
                className="block hover:text-primary transition-colors"
                onClick={() => window.scrollTo(0, 0)}
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; 2025 Imagine Beyond Travel. All rights reserved.
          </p>

          <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
            <Link
              to="/terms"
              className="hover:text-primary transition-colors"
              onClick={() => window.scrollTo(0, 0)}
            >
              Terms &amp; Conditions
            </Link>
            <span>•</span>
            <a
              href="https://www.imaginebeyondtravel.com/#/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
