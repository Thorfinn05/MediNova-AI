import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, FileText, Heart, History, User, Pill } from "lucide-react";
import { collection, query, orderBy, limit, getDocs, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Define interfaces for the activity data
interface ActivityItem {
  id: string;
  type: "diagnosis" | "prescription" | "radiology";
  title?: string;
  summary?: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
}

interface HealthStats {
  diagnoses: number;
  radiologyAnalyses: number;
  prescriptionAnalyses: number;
  healthScore: number;
}

const Dashboard = () => {
  const { userRole, currentUser } = useAuth();
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [healthStats, setHealthStats] = useState<HealthStats>({
    diagnoses: 0,
    radiologyAnalyses: 0,
    prescriptionAnalyses: 0,
    healthScore: 85
  });
  
  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!currentUser?.uid) return;
      
      try {
        console.log("Fetching recent activity for user:", currentUser.uid);
        
        const diagnosesQuery = query(
          collection(db, "diagnoses", currentUser.uid, "sessions"),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        
        const querySnapshot = await getDocs(diagnosesQuery);
        console.log("Query snapshot size:", querySnapshot.size);
        
        const diagnosesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: "diagnosis"
        })) as ActivityItem[];
        
        // Add prescription data if available
        const prescriptionsQuery = query(
          collection(db, "prescriptions", currentUser.uid, "sessions"),
          orderBy("createdAt", "desc"),
          limit(2)
        );
        
        const prescriptionSnapshot = await getDocs(prescriptionsQuery);
        const prescriptionsData = prescriptionSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: "prescription"
        })) as ActivityItem[];
        
        // Add radiology data if available
        const radiologyQuery = query(
          collection(db, "radiology", currentUser.uid, "sessions"),
          orderBy("createdAt", "desc"),
          limit(2)
        );
        
        const radiologySnapshot = await getDocs(radiologyQuery);
        const radiologyData = radiologySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: "radiology"
        })) as ActivityItem[];
        
        // Combine and sort by date
        const allActivity = [...diagnosesData, ...prescriptionsData, ...radiologyData].sort((a, b) => {
          // Add null check to handle potential undefined createdAt
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        }).slice(0, 3);
        
        setRecentActivity(allActivity);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
      }
    };
    
    fetchRecentActivity();
  }, [currentUser]);

  useEffect(() => {
    const fetchHealthStats = async () => {
      if (!currentUser?.uid) return;
      
      try {
        console.log("Fetching health stats for user:", currentUser.uid);
        
        // Get counts for each collection
        const diagnosesQuery = query(collection(db, "diagnoses", currentUser.uid, "sessions"));
        const prescriptionsQuery = query(collection(db, "prescriptions", currentUser.uid, "sessions"));
        const radiologyQuery = query(collection(db, "radiology", currentUser.uid, "sessions"));
        
        const [diagnosesCount, prescriptionsCount, radiologyCount] = await Promise.all([
          getCountFromServer(diagnosesQuery),
          getCountFromServer(prescriptionsQuery),
          getCountFromServer(radiologyQuery)
        ]);
        
        const totalActivities = diagnosesCount.data().count + prescriptionsCount.data().count + radiologyCount.data().count;
        
        // Calculate health score based on activity (more activity = better health awareness)
        let healthScore = 75; // Base score
        if (totalActivities > 0) healthScore += Math.min(25, totalActivities * 5); // Max 100%
        
        setHealthStats({
          diagnoses: diagnosesCount.data().count,
          radiologyAnalyses: radiologyCount.data().count,
          prescriptionAnalyses: prescriptionsCount.data().count,
          healthScore: Math.min(100, healthScore)
        });
        
        console.log("Health stats updated:", {
          diagnoses: diagnosesCount.data().count,
          radiologyAnalyses: radiologyCount.data().count,
          prescriptionAnalyses: prescriptionsCount.data().count,
          healthScore: Math.min(100, healthScore)
        });
      } catch (error) {
        console.error("Error fetching health stats:", error);
        // Keep default values if there's an error
      }
    };
    
    fetchHealthStats();
  }, [currentUser]);

  // Helper function to get text based on user role
  const getRoleBasedText = (patientText: string, doctorText: string) => {
    return userRole === "patient" ? patientText : doctorText;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
        <p className="text-muted-foreground mt-1">
          {getRoleBasedText(
            "Your personal healthcare dashboard", 
            "Your medical practice dashboard"
          )}
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-gradient hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              Smart Diagnosis
            </CardTitle>
            <CardDescription>
              {getRoleBasedText(
                "Get AI-powered symptom analysis", 
                "Review and validate AI diagnoses"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            <div className="h-12 flex items-center">
              <p className="text-sm">
                {getRoleBasedText(
                  "Analyze symptoms and get personalized health guidance", 
                  "Review patient cases and provide professional oversight"
                )}
              </p>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              onClick={() => navigate("/diagnosis")} 
              className="w-full"
            >
              {getRoleBasedText("Start Diagnosis", "Review Cases")}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="card-gradient hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Radiology Assistant
            </CardTitle>
            <CardDescription>
              {getRoleBasedText(
                "Upload and analyze radiology images", 
                "Review and annotate patient scans"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            <div className="h-12 flex items-center">
              <p className="text-sm">
                {getRoleBasedText(
                  "Get AI analysis for your medical images with expert annotations", 
                  "Use AI to assist with image analysis and provide expert insights"
                )}
              </p>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              onClick={() => navigate("/radiology")} 
              className="w-full"
            >
              {getRoleBasedText("Upload Images", "Analyze Images")}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="card-gradient hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Pill className="h-5 w-5 mr-2 text-primary" />
              Prescription Analyzer
            </CardTitle>
            <CardDescription>
              {getRoleBasedText(
                "Analyze prescriptions and find alternatives", 
                "Review prescription details"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            <div className="h-12 flex items-center">
              <p className="text-sm">
                {getRoleBasedText(
                  "Upload and get AI analysis of your prescriptions with alternatives", 
                  "Review patient prescriptions and suggest improvements"
                )}
              </p>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              onClick={() => navigate("/prescription")} 
              className="w-full bg-gradient-to-r from-teal-600 to-azure-600 text-white hover:opacity-90"
            >
              {getRoleBasedText("Analyze Prescription", "Review Prescriptions")}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="card-gradient hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <User className="h-5 w-5 mr-2 text-primary" />
              Health Profile
            </CardTitle>
            <CardDescription>
              {getRoleBasedText(
                "View and update your health information", 
                "Manage your professional profile"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            <div className="h-12 flex items-center">
              <p className="text-sm">
                {getRoleBasedText(
                  "Keep your health information up to date for more accurate results", 
                  "Maintain your professional credentials and specialties"
                )}
              </p>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              onClick={() => navigate("/profile")} 
              variant="outline" 
              className="w-full"
            >
              View Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <History className="h-5 w-5 mr-2 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest health interactions and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-start p-3 rounded-md border"
                    >
                      <div className="mr-4 mt-1">
                        {activity.type === "diagnosis" ? (
                          <Activity className="h-5 w-5 text-primary" />
                        ) : activity.type === "prescription" ? (
                          <Pill className="h-5 w-5 text-primary" />
                        ) : (
                          <FileText className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">
                          {activity.title || (activity.type === "diagnosis" ? "Diagnosis Session" : 
                            activity.type === "prescription" ? "Prescription Analysis" : "Radiology Analysis")}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.createdAt && activity.createdAt.seconds ? 
                            new Date(activity.createdAt.seconds * 1000).toLocaleString() :
                            "Date not available"}
                        </p>
                        <p className="text-sm mt-1">
                          {activity.summary || "No summary available"}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2"
                        onClick={() => navigate(activity.type === "diagnosis" ? 
                          `/diagnosis/${activity.id}` : 
                          activity.type === "prescription" ? `/prescription/${activity.id}` :
                          `/radiology/${activity.id}`
                        )}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No recent activity</p>
                  <Button 
                    variant="link" 
                    onClick={() => navigate("/diagnosis")}
                    className="mt-2"
                  >
                    Start your first diagnosis
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => navigate("/history")}
                className="w-full"
              >
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Heart className="h-5 w-5 mr-2 text-primary" />
                Health Stats
              </CardTitle>
              <CardDescription>
                {getRoleBasedText(
                  "Your key health metrics", 
                  "Patient statistics overview"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userRole === "patient" ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Diagnoses</span>
                      <span className="font-medium">{healthStats.diagnoses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Radiology Analyses</span>
                      <span className="font-medium">{healthStats.radiologyAnalyses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Prescription Analyses</span>
                      <span className="font-medium">{healthStats.prescriptionAnalyses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Health Score</span>
                      <span className={`font-medium ${healthStats.healthScore >= 90 ? 'text-green-600 dark:text-green-400' : 
                        healthStats.healthScore >= 80 ? 'text-teal-600 dark:text-teal-400' : 
                        'text-orange-600 dark:text-orange-400'}`}>
                        {healthStats.healthScore}%
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Patients</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Reviews Pending</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Cases</span>
                      <span className="font-medium">48</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
