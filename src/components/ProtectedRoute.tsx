
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "patient" | "doctor" | null;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { currentUser, userRole, isLoading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to access this page.",
      });
    } else if (
      !isLoading &&
      currentUser &&
      requiredRole &&
      userRole !== requiredRole
    ) {
      toast({
        variant: "destructive",
        title: "Access denied",
        description: `Only ${requiredRole}s can access this page.`,
      });
    }
  }, [isLoading, currentUser, requiredRole, userRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-pulse-light text-2xl text-primary">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
