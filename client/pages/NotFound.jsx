import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-2">Oops! Page not found</p>
        <p className="text-sm text-muted-foreground mb-6">
          The page {location.pathname} doesn't exist
        </p>
        <Link to="/login">
          <Button className="gap-2">
            <Home className="w-4 h-4" />
            Return to Login
          </Button>
        </Link>
      </div>

      <footer className="w-full text-center py-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
          developed by prawinkumar &copy; {new Date().getFullYear()} All rights received
        </p>
      </footer>
    </div>
  );
};

export default NotFound;
