import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Scale, LogOut, User, Brain, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isHR, setIsHR] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkHRRole(session.user.id);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkHRRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkHRRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'hr')
      .maybeSingle();
    
    setIsHR(!!data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 glass-card">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl group">
          <div className="relative">
            <Scale className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            <Brain className="absolute -right-1 -top-1 h-3 w-3 text-accent animate-pulse" />
          </div>
          <span className="gradient-text">MalipoHaki</span>
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
          {user && (
            <>
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
              {isHR && (
                <Link
                  to="/company"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/company") ? "text-primary" : "text-foreground/80"
                  }`}
                >
                  <Building2 className="inline h-4 w-4 mr-1" />
                  Company
                </Link>
              )}
            </>
          )}
          <Link
            to="/about"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/about") ? "text-primary" : "text-foreground/80"
            }`}
          >
            About
          </Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card">
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
