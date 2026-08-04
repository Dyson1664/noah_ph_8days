import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ibtLogo from "@/assets/ibt-logo.svg";

interface NavbarProps {
  logoStyle?: React.CSSProperties;
}

const Navbar = memo(({ logoStyle }: NavbarProps = {}) => {
  return (
    <nav className="bg-white text-gray-900 border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo/Home Button */}
          <Link to="/">
            <Button
              variant="link"
              className="text-xl font-bold text-primary hover:no-underline p-0 flex items-center gap-3
              focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            >
              <img
                src={ibtLogo}
                alt="IBT Logo"
                className="block h-[72px] w-auto md:h-16 lg:h-20 shrink-0 md:mt-[-2px] lg:mt-[-4px]"
                style={logoStyle}
              />
              <div className="flex flex-col items-center">
                <span>Imagine Beyond</span>
                <span className="text-base md:text-lg font-semibold leading-none">
                  Travel
                </span>
              </div>
            </Button>
          </Link>

          <div className="ml-3 flex items-center">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="shrink-0 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Link to="/guest-login">Guest Login</Link>
            </Button>
          </div>

          {/* Mobile menu button (disabled until there are mobile links to show) */}
          {/* <div className="md:hidden ml-auto">
            <Button variant="ghost" size="sm" className="text-foreground">
              <Menu className="w-5 h-5" />
            </Button>
          </div> */}
        </div>
      </div>
    </nav>
  );
});

export default Navbar;
