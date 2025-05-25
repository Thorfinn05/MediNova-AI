// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useAuth } from "@/contexts/AuthContext";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import { UserRole } from "@/contexts/AuthContext";
// import { Separator } from "@/components/ui/separator";
// import { Mail } from "lucide-react";
// import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// const authFormSchema = z.object({
//   email: z.string().email("Please enter a valid email address"),
//   password: z.string().min(6, "Password must be at least 6 characters long"),
// });

// const registerFormSchema = authFormSchema.extend({
//   role: z.enum(["patient", "doctor"], {
//     required_error: "Please select a role",
//   }),
// });

// type AuthFormValues = z.infer<typeof authFormSchema>;
// type RegisterFormValues = z.infer<typeof registerFormSchema>;

// const Auth = () => {
//   const [isLoggingIn, setIsLoggingIn] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [authError, setAuthError] = useState<string | null>(null);
//   const { signIn, signUp, signInWithGoogle } = useAuth();
//   const navigate = useNavigate();

//   const loginForm = useForm<AuthFormValues>({
//     resolver: zodResolver(authFormSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const registerForm = useForm<RegisterFormValues>({
//     resolver: zodResolver(registerFormSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//       role: "patient",
//     },
//   });

//   const onLoginSubmit = async (data: AuthFormValues) => {
//     try {
//       setIsSubmitting(true);
//       setAuthError(null);
//       await signIn(data.email, data.password);
//       navigate("/dashboard");
//     } catch (error: any) {
//       console.error("Login error:", error);
//       setAuthError(error.message || "Failed to sign in. Please check your credentials.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const onRegisterSubmit = async (data: RegisterFormValues) => {
//     try {
//       setIsSubmitting(true);
//       setAuthError(null);
//       await signUp(data.email, data.password, data.role as UserRole);
//       navigate("/dashboard");
//     } catch (error: any) {
//       console.error("Registration error:", error);
//       setAuthError(error.message || "Failed to create account. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleGoogleSignIn = async (role: UserRole) => {
//     try {
//       setIsSubmitting(true);
//       setAuthError(null);
//       await signInWithGoogle(role);
//       navigate("/dashboard");
//     } catch (error: any) {
//       console.error("Google sign-in error:", error);
//       setAuthError(error.message || "Google sign-in failed. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full flex items-center justify-center hero-gradient">
//       <div className="container max-w-md animate-fade-in">
//         <Card className="glass shadow-lg">
//           <CardHeader className="space-y-1 text-center">
//             <CardTitle className="text-3xl font-bold bg-gradient-to-r from-aether-600 to-mint-600 bg-clip-text text-transparent">
//               AetherCare
//             </CardTitle>
//             <CardDescription>
//               Your AI-powered healthcare companion
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {authError && (
//               <Alert variant="destructive" className="mb-4">
//                 <AlertTitle>Error</AlertTitle>
//                 <AlertDescription>{authError}</AlertDescription>
//               </Alert>
//             )}
            
//             <Tabs defaultValue="login" onValueChange={(value) => setIsLoggingIn(value === "login")}>
//               <TabsList className="grid w-full grid-cols-2 mb-6">
//                 <TabsTrigger value="login">Login</TabsTrigger>
//                 <TabsTrigger value="register">Register</TabsTrigger>
//               </TabsList>
              
//               <TabsContent value="login">
//                 <Form {...loginForm}>
//                   <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
//                     <FormField
//                       control={loginForm.control}
//                       name="email"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Email</FormLabel>
//                           <FormControl>
//                             <Input placeholder="your.email@example.com" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={loginForm.control}
//                       name="password"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Password</FormLabel>
//                           <FormControl>
//                             <Input type="password" placeholder="••••••••" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <Button type="submit" className="w-full" disabled={isSubmitting}>
//                       {isSubmitting ? "Signing in..." : "Sign In"}
//                     </Button>
                    
//                     <div className="relative my-4">
//                       <div className="absolute inset-0 flex items-center">
//                         <Separator className="w-full" />
//                       </div>
//                       <div className="relative flex justify-center text-xs uppercase">
//                         <span className="bg-background px-2 text-muted-foreground">
//                           Or continue with
//                         </span>
//                       </div>
//                     </div>
                    
//                     <div className="grid grid-cols-2 gap-4">
//                       <Button 
//                         type="button" 
//                         variant="outline" 
//                         onClick={() => handleGoogleSignIn("patient")}
//                         disabled={isSubmitting}
//                         className="w-full"
//                       >
//                         <Mail className="mr-2 h-4 w-4" />
//                         As Patient
//                       </Button>
//                       <Button 
//                         type="button" 
//                         variant="outline" 
//                         onClick={() => handleGoogleSignIn("doctor")}
//                         disabled={isSubmitting}
//                         className="w-full"
//                       >
//                         <Mail className="mr-2 h-4 w-4" />
//                         As Doctor
//                       </Button>
//                     </div>
//                   </form>
//                 </Form>
//               </TabsContent>
              
//               <TabsContent value="register">
//                 <Form {...registerForm}>
//                   <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
//                     <FormField
//                       control={registerForm.control}
//                       name="email"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Email</FormLabel>
//                           <FormControl>
//                             <Input placeholder="your.email@example.com" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={registerForm.control}
//                       name="password"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Password</FormLabel>
//                           <FormControl>
//                             <Input type="password" placeholder="••••••••" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={registerForm.control}
//                       name="role"
//                       render={({ field }) => (
//                         <FormItem className="py-2">
//                           <FormLabel>Role</FormLabel>
//                           <FormControl>
//                             <RadioGroup
//                               onValueChange={field.onChange}
//                               defaultValue={field.value}
//                               className="flex gap-6"
//                             >
//                               <div className="flex items-center space-x-2">
//                                 <RadioGroupItem value="patient" id="patient" />
//                                 <Label htmlFor="patient">Patient</Label>
//                               </div>
//                               <div className="flex items-center space-x-2">
//                                 <RadioGroupItem value="doctor" id="doctor" />
//                                 <Label htmlFor="doctor">Doctor</Label>
//                               </div>
//                             </RadioGroup>
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <Button type="submit" className="w-full" disabled={isSubmitting}>
//                       {isSubmitting ? "Creating account..." : "Create Account"}
//                     </Button>
                    
//                     <div className="relative my-4">
//                       <div className="absolute inset-0 flex items-center">
//                         <Separator className="w-full" />
//                       </div>
//                       <div className="relative flex justify-center text-xs uppercase">
//                         <span className="bg-background px-2 text-muted-foreground">
//                           Or continue with
//                         </span>
//                       </div>
//                     </div>
                    
//                     <div className="grid grid-cols-2 gap-4">
//                       <Button 
//                         type="button" 
//                         variant="outline" 
//                         onClick={() => handleGoogleSignIn("patient")}
//                         disabled={isSubmitting}
//                         className="w-full"
//                       >
//                         <Mail className="mr-2 h-4 w-4" />
//                         As Patient
//                       </Button>
//                       <Button 
//                         type="button" 
//                         variant="outline" 
//                         onClick={() => handleGoogleSignIn("doctor")}
//                         disabled={isSubmitting}
//                         className="w-full"
//                       >
//                         <Mail className="mr-2 h-4 w-4" />
//                         As Doctor
//                       </Button>
//                     </div>
//                   </form>
//                 </Form>
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//           <CardFooter className="text-sm text-center flex justify-center text-muted-foreground">
//             <p>Protected by AetherCare security</p>
//           </CardFooter>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Auth;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UserRole } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Chrome } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const authFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["patient", "doctor"], {
    required_error: "Please select a role",
  }),
});

const registerFormSchema = authFormSchema;

type AuthFormValues = z.infer<typeof authFormSchema>;
type RegisterFormValues = z.infer<typeof registerFormSchema>;

const Auth = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "patient",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "patient",
    },
  });

  const onLoginSubmit = async (data: AuthFormValues) => {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      await signIn(data.email, data.password);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      setAuthError(error.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      await signUp(data.email, data.password, data.role as UserRole);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      setAuthError(error.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async (role: UserRole) => {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      await signInWithGoogle(role);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      setAuthError(error.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center hero-gradient">
      <div className="container max-w-md animate-fade-in">
        <Card className="glass shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-aether-600 to-mint-600 bg-clip-text text-transparent">
              MediNova AI
            </CardTitle>
            <CardDescription>
              Your AI-powered healthcare companion
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            
            <Tabs defaultValue="login" onValueChange={(value) => setIsLoggingIn(value === "login")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="py-2">
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="patient" id="login-patient" />
                                <Label htmlFor="login-patient">Patient</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="doctor" id="login-doctor" />
                                <Label htmlFor="login-doctor">Doctor</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>
                    
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => handleGoogleSignIn("patient")}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        <Chrome className="mr-2 h-4 w-4" />
                        As Patient
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => handleGoogleSignIn("doctor")}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        <Chrome className="mr-2 h-4 w-4" />
                        As Doctor
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="py-2">
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="patient" id="register-patient" />
                                <Label htmlFor="register-patient">Patient</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="doctor" id="register-doctor" />
                                <Label htmlFor="register-doctor">Doctor</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Creating account..." : "Create Account"}
                    </Button>
                    
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => handleGoogleSignIn("patient")}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        <Chrome className="mr-2 h-4 w-4" />
                        As Patient
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => handleGoogleSignIn("doctor")}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        <Chrome className="mr-2 h-4 w-4" />
                        As Doctor
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="text-sm text-center flex justify-center text-muted-foreground">
            <p>Protected by AetherCare security</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;