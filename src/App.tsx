
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/MainLayout";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Diagnosis from "./pages/Diagnosis";
import Radiology from "./pages/Radiology";
import Profile from "./pages/Profile";
import Prescription from "./pages/Prescription";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/diagnosis" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Diagnosis />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/diagnosis/:id" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Diagnosis />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/radiology" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Radiology />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/prescription" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Prescription />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/prescription/:id" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Prescription />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
