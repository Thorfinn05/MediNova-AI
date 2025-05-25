import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import AetherChatbot from "@/components/AetherChatbot";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Bell, Home, Settings, User, LogOut, Activity, FileText, Pill, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { currentUser, userRole, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [initials, setInitials] = useState("U");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (currentUser?.email) {
      const emailInitial = currentUser.email.charAt(0).toUpperCase();
      setInitials(emailInitial);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { 
      name: "Dashboard", 
      path: "/dashboard", 
      icon: <Home className="h-5 w-5 mr-2" /> 
    },
    { 
      name: "Diagnosis", 
      path: "/diagnosis", 
      icon: <Activity className="h-5 w-5 mr-2" /> 
    },
    { 
      name: "Radiology", 
      path: "/radiology", 
      icon: <FileText className="h-5 w-5 mr-2" /> 
    },
    { 
      name: "Prescription", 
      path: "/prescription", 
      icon: <Pill className="h-5 w-5 mr-2" /> 
    },
    { 
      name: "Profile", 
      path: "/profile", 
      icon: <User className="h-5 w-5 mr-2" /> 
    },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-lg shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full flex items-center justify-center">
              {/* <span className="text-white font-bold text-sm">M</span> */}
              <img
                src="/Medinova-logo.png"
                alt="MediNova Logo"
                className="h-12 w-12 rounded-full object-cover"
              />
            </div>
            <Link 
              to="/dashboard" 
              className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-azure-600 bg-clip-text text-transparent"
            >
              MediNova
            </Link>
            
            <span className="text-sm px-2 py-1 rounded bg-primary/10 text-primary font-medium hidden sm:inline-block">
              {userRole === "patient" ? "Patient Portal" : "Doctor Portal"}
            </span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-4">
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        isActivePath(item.path)
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground/70 hover:text-foreground"
                      )}
                    >
                      {item.name}
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {currentUser?.email}
                  <p className="text-xs text-muted-foreground mt-1">
                    {userRole === "patient" ? "Patient Account" : "Doctor Account"}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border shadow-md py-4 px-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center text-sm font-medium px-3 py-2 rounded-md hover:bg-secondary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {React.cloneElement(item.icon, { className: "h-5 w-5 mr-2" })}
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-2">
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?tab=register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="bg-gradient-to-r from-teal-600 to-azure-600 text-white hover:opacity-90 w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
      
      {/* Main content - adjusted for fixed header */}
      <div className="flex flex-1 pt-20">
        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6 md:py-8 mb-16 md:mb-0">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-background border-t">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 4).map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`p-2 rounded-md flex flex-col items-center text-xs
                ${isActivePath(item.path) 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {React.cloneElement(item.icon, { className: "h-5 w-5 mb-1" })}
              {item.name.slice(0, 5)}
            </Link>
          ))}
        </div>
      </div>

      {/* Aether Chatbot */}
      <AetherChatbot />
    </div>
  );
};

export default MainLayout;
