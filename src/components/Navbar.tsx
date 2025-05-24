
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu } from "lucide-react";

export function Navbar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-lg shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-12 w-12 rounded-full flex items-center justify-center">
            {/* <span className="text-white font-bold text-sm">M</span> */}
            <img
              src="/Medinova-logo.png"
              alt="MediNova Logo"
              className="h-12 w-12 rounded-full object-cover"
            />
          </div>
          <span className="font-bold text-xl text-gradient">MediNova AI</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              location.pathname === "/" 
                ? "text-primary" 
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            to="/#features"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            to="/#how-it-works"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            How It Works
          </Link>
          <Link
            to="/#about"
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/auth?tab=register">
              <Button className="modern-gradient text-white hover:opacity-90" size="sm">
                Get Started
              </Button>
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border shadow-md py-4 px-4">
          <nav className="flex flex-col space-y-4">
            <Link
              to="/"
              className="text-sm font-medium px-3 py-2 rounded-md hover:bg-secondary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/#features"
              className="text-sm font-medium px-3 py-2 rounded-md hover:bg-secondary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/#how-it-works"
              className="text-sm font-medium px-3 py-2 rounded-md hover:bg-secondary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              to="/#about"
              className="text-sm font-medium px-3 py-2 rounded-md hover:bg-secondary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="flex flex-col space-y-2 pt-2">
              <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?tab=register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="modern-gradient text-white hover:opacity-90 w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
