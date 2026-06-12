import "./global.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthRoutes } from "@/routes/AuthRoutes";
import { PrivateRoutes } from "@/routes/PrivateRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
});

/**
 * PrivateLayer - Wraps authenticated routes with required providers.
 * Loaded ONLY after user is logged in.
 */
const PrivateLayer = ({ children }) => {
  return (
    <NotificationProvider>
      <SocketProvider>
        <Toaster />
        <Sonner />
        {children}
      </SocketProvider>
    </NotificationProvider>
  );
};

/**
 * RootApp - Main entry point that handles high-level provider logic.
 */
const RootApp = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Let the splash screen or auth context handle initial loading
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        {user ? (
          <PrivateLayer>
            <PrivateRoutes />
          </PrivateLayer>
        ) : (
          <AuthRoutes /> 
        )}
      </ErrorBoundary>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
           <RootApp />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")).render(<App />);
