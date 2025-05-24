
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Calendar, Clock, Activity, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const patientProfileSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  notificationsEnabled: z.boolean().default(true),
});

const doctorProfileSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  specialization: z.string().min(2, "Specialization is required"),
  licenseNumber: z.string().min(2, "License number is required"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  notificationsEnabled: z.boolean().default(true),
});

type PatientProfileFormValues = z.infer<typeof patientProfileSchema>;
type DoctorProfileFormValues = z.infer<typeof doctorProfileSchema>;

const Profile = () => {
  const { currentUser, userRole } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const defaultPatientValues: PatientProfileFormValues = {
    fullName: "John Doe",
    dateOfBirth: "1985-05-15",
    phone: "+1 (555) 123-4567",
    emergencyContact: "Jane Doe: +1 (555) 987-6543",
    allergies: "Penicillin, Peanuts",
    medications: "Lisinopril 10mg daily, Vitamin D 1000IU daily",
    notificationsEnabled: true,
  };

  const defaultDoctorValues: DoctorProfileFormValues = {
    fullName: "Dr. Sarah Smith",
    specialization: "Cardiology",
    licenseNumber: "MD12345",
    phone: "+1 (555) 234-5678",
    bio: "Board-certified cardiologist with 10 years of experience in interventional cardiology and heart failure management.",
    notificationsEnabled: true,
  };

  const patientForm = useForm<PatientProfileFormValues>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: defaultPatientValues,
  });

  const doctorForm = useForm<DoctorProfileFormValues>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: defaultDoctorValues,
  });

  const onPatientSubmit = (data: PatientProfileFormValues) => {
    // In a real app, this would update the user's profile in Firestore
    console.log("Updated patient profile:", data);
    
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
    
    setIsEditing(false);
  };

  const onDoctorSubmit = (data: DoctorProfileFormValues) => {
    // In a real app, this would update the doctor's profile in Firestore
    console.log("Updated doctor profile:", data);
    
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
    
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and preferences
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {userRole === "patient" ? "JD" : "SS"}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <h2 className="text-xl font-bold">
                  {userRole === "patient" ? defaultPatientValues.fullName : defaultDoctorValues.fullName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {userRole === "doctor" && defaultDoctorValues.specialization}
                  {userRole === "patient" && "Patient"}
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel Editing" : "Edit Profile"}
              </Button>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {currentUser?.email || "user@example.com"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Account Type</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {userRole || "Patient"}
                  </p>
                </div>
              </div>
              
              {userRole === "patient" && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Date of Birth</p>
                    <p className="text-sm text-muted-foreground">
                      {defaultPatientValues.dateOfBirth}
                    </p>
                  </div>
                </div>
              )}
              
              {userRole === "doctor" && (
                <div className="flex items-start gap-3">
                  <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">License</p>
                    <p className="text-sm text-muted-foreground">
                      {defaultDoctorValues.licenseNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-3 space-y-6">
          {userRole === "patient" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Patient Information</CardTitle>
                <CardDescription>
                  Your personal health information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Form {...patientForm}>
                    <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={patientForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={patientForm.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={patientForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={patientForm.control}
                          name="emergencyContact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency Contact</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                Name and phone number of emergency contact
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={patientForm.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allergies</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              List any allergies you have (medications, food, etc.)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={patientForm.control}
                        name="medications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Medications</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              List medications you're currently taking, including dosage
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={patientForm.control}
                        name="notificationsEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Notifications</FormLabel>
                              <FormDescription>
                                Receive updates about your health reports and appointments
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Full Name</h3>
                        <p>{defaultPatientValues.fullName}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Date of Birth</h3>
                        <p>{defaultPatientValues.dateOfBirth}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone Number</h3>
                        <p>{defaultPatientValues.phone}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Emergency Contact</h3>
                        <p>{defaultPatientValues.emergencyContact}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Allergies</h3>
                      <p>{defaultPatientValues.allergies || "None listed"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Medications</h3>
                      <p>{defaultPatientValues.medications || "None listed"}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about your health reports and appointments
                        </p>
                      </div>
                      <Switch checked={defaultPatientValues.notificationsEnabled} disabled />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Doctor Information</CardTitle>
                <CardDescription>
                  Your professional profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Form {...doctorForm}>
                    <form onSubmit={doctorForm.handleSubmit(onDoctorSubmit)} className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={doctorForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={doctorForm.control}
                          name="specialization"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Specialization</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={doctorForm.control}
                          name="licenseNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>License Number</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={doctorForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={doctorForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Bio</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              A brief description of your professional background and expertise
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={doctorForm.control}
                        name="notificationsEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Notifications</FormLabel>
                              <FormDescription>
                                Receive updates about patient cases and system alerts
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Full Name</h3>
                        <p>{defaultDoctorValues.fullName}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Specialization</h3>
                        <p>{defaultDoctorValues.specialization}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">License Number</h3>
                        <p>{defaultDoctorValues.licenseNumber}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone Number</h3>
                        <p>{defaultDoctorValues.phone}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Professional Bio</h3>
                      <p>{defaultDoctorValues.bio}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about patient cases and system alerts
                        </p>
                      </div>
                      <Switch checked={defaultDoctorValues.notificationsEnabled} disabled />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Account Security</CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Change Password</h3>
                    <p className="text-sm text-muted-foreground">
                      Update your password to ensure account security
                    </p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <h3 className="font-medium text-destructive">Delete Account</h3>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
