import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Scale } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Scale className="h-6 w-6 text-primary" />
          <span>MalipoHaki</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/") ? "text-primary" : "text-foreground/80"
            }`}
          >
            Home
          </Link>
          <Link
            to="/check"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/check") ? "text-primary" : "text-foreground/80"
            }`}
          >
            Check Fairness
          </Link>
          <Link
            to="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/dashboard") ? "text-primary" : "text-foreground/80"
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/about"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/about") ? "text-primary" : "text-foreground/80"
            }`}
          >
            About
          </Link>
          <Button asChild>
            <Link to="/check">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
