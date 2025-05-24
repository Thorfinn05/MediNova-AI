
import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";

export type UserRole = "patient" | "doctor" | null;

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  signInWithGoogle: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserRole = async (uid: string) => {
    try {
      const userRef = doc(db, "roles", uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role as UserRole);
      } else {
        console.log("No role found for user");
        setUserRole(null);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch user role. Please try again later.",
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserRole(user.uid);
      } else {
        setUserRole(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserRole(userCredential.user.uid);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error.message || "Failed to sign in. Please check your credentials.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: UserRole) => {
    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Store user role in Firestore
      await setDoc(doc(db, "roles", userCredential.user.uid), {
        role: role,
        email: email,
        createdAt: new Date().toISOString()
      });
      
      setUserRole(role);
      
      toast({
        title: "Account created",
        description: `You have successfully registered as a ${role}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Failed to create account. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (role: UserRole) => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user already exists in our roles collection
      const userRef = doc(db, "roles", user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // If new user, save their role
        await setDoc(userRef, {
          role: role,
          email: user.email,
          createdAt: new Date().toISOString(),
          authProvider: "google"
        });
      }
      
      await fetchUserRole(user.uid);
      
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Google.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google sign-in failed",
        description: error.message || "Failed to sign in with Google. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message || "Failed to sign out. Please try again.",
      });
      throw error;
    }
  };

  const value = {
    currentUser,
    userRole,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
