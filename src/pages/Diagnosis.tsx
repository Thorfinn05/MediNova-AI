import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle2, Clock, Download, Mic, MicOff, User, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, doc, addDoc, serverTimestamp, getDoc } from "firebase/firestore";
import GeminiService from "@/services/GeminiService";
import { toast as sonnerToast } from "sonner";

const diagnosisSchema = z.object({
  category: z.enum(["self", "other"], {
    required_error: "Please select if this is for yourself or someone else",
  }),
  symptoms: z.string().min(10, "Please describe symptoms in more detail"),
  age: z.string().min(1, "Age is required"),
  previousConditions: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
});

type DiagnosisFormValues = z.infer<typeof diagnosisSchema>;

interface DiagnosisResult {
  conditions: {
    name: string;
    confidence: {
      level: "High" | "Medium" | "Low";
      percentage?: number;
    };
    reasoning: string;
  }[];
  tests: {
    name: string;
    purpose?: string;
    urgency?: "High" | "Medium" | "Low";
  }[];
  treatments: {
    action: string;
    explanation?: string;
  }[];
  warningsSigns?: string[];
  reasoningTree: string[];
}

const Diagnosis = () => {
  const { currentUser, userRole } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<DiagnosisFormValues>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: {
      category: "self",
      symptoms: "",
      age: "",
      previousConditions: "",
      allergies: "",
      medications: "",
    },
  });

  const watchCategory = form.watch("category");

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!currentUser) return;
      
      try {
        const profileRef = doc(db, "profiles", currentUser.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setUserProfile(profileSnap.data());
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    };

    loadUserProfile();
  }, [currentUser]);

  // Auto-fill data when category is "self" and profile is available
  useEffect(() => {
    if (watchCategory === "self" && userProfile) {
      const today = new Date();
      const birthDate = new Date(userProfile.dateOfBirth);
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }

      form.setValue("age", calculatedAge.toString());
      form.setValue("allergies", userProfile.allergies || "");
      form.setValue("medications", userProfile.medications || "");
    } else if (watchCategory === "other") {
      // Clear auto-filled data for other category
      form.setValue("age", "");
      form.setValue("allergies", "");
      form.setValue("medications", "");
    }
  }, [watchCategory, userProfile, form]);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        
        // Convert to text using Web Speech API
        const SpeechRecognition = (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
        if (!SpeechRecognition) {
          toast({
            title: "Speech recognition not supported",
            description: "Your browser does not support speech recognition.",
            variant: "destructive",
          });
          return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join(' ');
          
          const currentSymptoms = form.getValues("symptoms");
          form.setValue("symptoms", currentSymptoms + (currentSymptoms ? " " : "") + transcript);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          toast({
            title: "Voice recording error",
            description: "Could not convert speech to text. Please try again.",
            variant: "destructive",
          });
        };

        recognition.start();
        
        // Stop recording after the blob is processed
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak your symptoms clearly. Click the mic again to stop.",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice input.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      
      toast({
        title: "Recording stopped",
        description: "Processing your voice input...",
      });
    }
  };

  const parseConditionsFromResponse = (response: string) => {
    try {
      const conditions = [];
      console.log("Parsing conditions from:", response);
      
      const patterns = [
        /✅\s*(?:Possible\s*)?Condition\(s\)?:?\s*([\s\S]*?)(?=🧪|🩺|💊|🧠|$)/i,
        /Condition\(s\)?:?\s*([\s\S]*?)(?=Test|Treatment|Reasoning|$)/i
      ];
      
      let conditionsText = "";
      for (const pattern of patterns) {
        const match = response.match(pattern);
        if (match) {
          conditionsText = match[1].trim();
          break;
        }
      }
      
      if (conditionsText) {
        const lines = conditionsText.split('\n').filter(line => 
          line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')
        );
        
        for (const line of lines) {
          const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();
          if (cleanLine) {
            const confidenceMatch = cleanLine.match(/(.*?)\s*-\s*Confidence:\s*(\w+)\s*\(?(\d+)%?\)?/i);
            
            if (confidenceMatch) {
              conditions.push({
                name: confidenceMatch[1].trim(),
                confidence: {
                  level: confidenceMatch[2] as "High" | "Medium" | "Low",
                  percentage: confidenceMatch[3] ? parseInt(confidenceMatch[3]) : undefined
                },
                reasoning: "Based on symptom analysis"
              });
            } else {
              conditions.push({
                name: cleanLine,
                confidence: { level: "Medium" as const },
                reasoning: "Based on symptom analysis"
              });
            }
          }
        }
      }
      
      if (conditions.length === 0) {
        conditions.push({
          name: "Further evaluation needed",
          confidence: { level: "Low" as const },
          reasoning: "Unable to determine specific condition from provided symptoms"
        });
      }
      
      console.log("Parsed conditions:", conditions);
      return conditions;
    } catch (error) {
      console.error("Error parsing conditions:", error);
      return [{
        name: "Analysis error - please try again",
        confidence: { level: "Low" as const },
        reasoning: "Error in processing response"
      }];
    }
  };
  
  const parseTestsFromResponse = (response: string) => {
    try {
      const tests = [];
      console.log("Parsing tests from:", response);
      
      const patterns = [
        /🧪\s*(?:Recommended\s*)?Tests?:?\s*([\s\S]*?)(?=💊|🧠|🚨|$)/i,
        /Tests?:?\s*([\s\S]*?)(?=Treatment|Reasoning|Warning|$)/i
      ];
      
      let testsText = "";
      for (const pattern of patterns) {
        const match = response.match(pattern);
        if (match) {
          testsText = match[1].trim();
          break;
        }
      }
      
      if (testsText) {
        const lines = testsText.split('\n').filter(line => 
          line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')
        );
        
        for (const line of lines) {
          const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();
          if (cleanLine) {
            const detailedMatch = cleanLine.match(/(.*?)\s*-\s*Purpose:\s*(.*?)\s*-\s*Urgency:\s*(\w+)/i);
            
            if (detailedMatch) {
              tests.push({
                name: detailedMatch[1].trim(),
                purpose: detailedMatch[2].trim(),
                urgency: detailedMatch[3] as "High" | "Medium" | "Low"
              });
            } else {
              tests.push({
                name: cleanLine,
                urgency: "Medium" as const
              });
            }
          }
        }
      }
      
      if (tests.length === 0) {
        tests.push({
          name: "Consult healthcare provider for appropriate testing",
          urgency: "Medium" as const
        });
      }
      
      console.log("Parsed tests:", tests);
      return tests;
    } catch (error) {
      console.error("Error parsing tests:", error);
      return [{ name: "Consult healthcare provider", urgency: "Medium" as const }];
    }
  };
  
  const parseTreatmentsFromResponse = (response: string) => {
    try {
      const treatments = [];
      const warningSigns = [];
      console.log("Parsing treatments from:", response);
      
      const treatmentPatterns = [
        /💊\s*(?:Treatment\s*(?:Recommendations?)?):?\s*([\s\S]*?)(?=🚨|🧠|When\s*to\s*See|$)/i,
        /Treatment:?\s*([\s\S]*?)(?=Warning|Reasoning|When\s*to\s*See|$)/i
      ];
      
      let treatmentsText = "";
      for (const pattern of treatmentPatterns) {
        const match = response.match(pattern);
        if (match) {
          treatmentsText = match[1].trim();
          break;
        }
      }
      
      if (treatmentsText) {
        const lines = treatmentsText.split('\n').filter(line => 
          line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')
        );
        
        for (const line of lines) {
          const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();
          if (cleanLine) {
            const explainedMatch = cleanLine.match(/(.*?)\s*-\s*(.*)/);
            
            if (explainedMatch) {
              treatments.push({
                action: explainedMatch[1].trim(),
                explanation: explainedMatch[2].trim()
              });
            } else {
              treatments.push({
                action: cleanLine
              });
            }
          }
        }
      }
      
      const warningPatterns = [
        /🚨\s*(?:When\s*to\s*See\s*(?:a\s*)?Doctor):?\s*([\s\S]*?)(?=\n\s*\n|$)/i,
        /When\s*to\s*See\s*(?:a\s*)?Doctor:?\s*([\s\S]*?)(?=\n\s*\n|$)/i
      ];
      
      let warningText = "";
      for (const pattern of warningPatterns) {
        const match = response.match(pattern);
        if (match) {
          warningText = match[1].trim();
          break;
        }
      }
      
      if (warningText) {
        const lines = warningText.split('\n').filter(line => 
          line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')
        );
        
        for (const line of lines) {
          const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();
          if (cleanLine) {
            warningSigns.push(cleanLine);
          }
        }
      }
      
      if (treatments.length === 0) {
        treatments.push({
          action: "Consult healthcare provider for appropriate treatment"
        });
      }
      
      console.log("Parsed treatments:", treatments);
      console.log("Parsed warnings:", warningSigns);
      return { treatments, warningSigns };
    } catch (error) {
      console.error("Error parsing treatments:", error);
      return { 
        treatments: [{ action: "Consult healthcare provider" }], 
        warningSigns: ["Seek immediate medical attention if symptoms worsen"] 
      };
    }
  };
  
  const parseReasoningFromResponse = (response: string) => {
    try {
      const reasoningLines = [];
      console.log("Parsing reasoning from:", response);
      
      const patterns = [
        /🧠\s*(?:Medical\s*)?Reasoning:?\s*([\s\S]*?)(?=\n\s*\n|$)/i,
        /Reasoning:?\s*([\s\S]*?)(?=\n\s*\n|$)/i
      ];
      
      let reasoningText = "";
      for (const pattern of patterns) {
        const match = response.match(pattern);
        if (match) {
          reasoningText = match[1].trim();
          break;
        }
      }
      
      if (reasoningText) {
        const lines = reasoningText.split('\n').filter(line => 
          line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().length > 10
        );
        
        for (const line of lines) {
          const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();
          if (cleanLine && cleanLine.length > 5) {
            reasoningLines.push(cleanLine);
          }
        }
      }
      
      if (reasoningLines.length === 0) {
        reasoningLines.push("Medical reasoning based on symptom presentation and clinical knowledge");
      }
      
      console.log("Parsed reasoning:", reasoningLines);
      return reasoningLines;
    } catch (error) {
      console.error("Error parsing reasoning:", error);
      return ["Analysis based on reported symptoms"];
    }
  };

  const runDiagnosis = async (data: DiagnosisFormValues) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setDiagnosisResult(null);
      
      // Create comprehensive prompt with all gathered information
      const comprehensiveSymptoms = `
Patient Information:
- Age: ${data.age} years
- Category: ${data.category === "self" ? "Self-analysis" : "Analysis for another person"}
- Previous Medical Conditions: ${data.previousConditions || "None mentioned"}
- Known Allergies: ${data.allergies || "None mentioned"}
- Current Medications: ${data.medications || "None mentioned"}

Current Symptoms:
${data.symptoms}

Please provide a comprehensive medical analysis considering the patient's age, medical history, allergies, and current medications when making recommendations.
      `;
      
      sonnerToast.loading("Analyzing comprehensive health data...");
      const response = await GeminiService.analyzeSymptoms(comprehensiveSymptoms, "symptoms");
      console.log("Full Gemini response:", response);
      
      const conditions = parseConditionsFromResponse(response);
      const tests = parseTestsFromResponse(response);
      const { treatments, warningSigns } = parseTreatmentsFromResponse(response);
      const reasoningTree = parseReasoningFromResponse(response);
      
      const result: DiagnosisResult = {
        conditions,
        tests,
        treatments,
        warningsSigns: warningSigns,
        reasoningTree
      };
      
      setDiagnosisResult(result);
      sonnerToast.dismiss();
      sonnerToast.success("Comprehensive analysis complete");
      
      // Save diagnosis to Firestore
      if (currentUser) {
        const diagnosisData = {
          ...data,
          result,
          createdAt: serverTimestamp(),
          userId: currentUser.uid,
          userRole,
          status: "completed",
          summary: `Analysis for ${data.category}: ${data.symptoms.substring(0, 100)}...`,
        };
        
        try {
          const sessionsRef = collection(db, "diagnoses", currentUser.uid, "sessions");
          await addDoc(sessionsRef, diagnosisData);
          
          toast({
            title: "Diagnosis saved",
            description: "Your comprehensive diagnosis results have been saved to your account.",
          });
        } catch (firestoreError) {
          console.error("Failed to save to Firestore:", firestoreError);
        }
      }
      
    } catch (err: any) {
      console.error("Diagnosis error:", err);
      setError("An error occurred during the diagnosis process. Please try again later.");
      sonnerToast.dismiss();
      sonnerToast.error(`Diagnosis failed: ${err.message || "Could not complete the analysis. Please try again."}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = async (data: DiagnosisFormValues) => {
    await runDiagnosis(data);
  };

  const generatePDF = () => {
    if (!diagnosisResult) return;
    
    // Create a new window with only the diagnosis results
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Diagnosis Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 20px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 5px; }
            .badge { background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
            .high { background: #fee2e2; color: #dc2626; }
            .medium { background: #fef3c7; color: #d97706; }
            .low { background: #dcfce7; color: #16a34a; }
            .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 10px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <h1>🩺 Comprehensive Diagnosis Report</h1>
          
          <h2>✅ Possible Conditions</h2>
          <ul>
            ${diagnosisResult.conditions.map(condition => `
              <li>
                <strong>${condition.name}</strong> 
                <span class="badge ${condition.confidence.level.toLowerCase()}">${condition.confidence.level}${condition.confidence.percentage ? ` (${condition.confidence.percentage}%)` : ''}</span>
                <br><em>${condition.reasoning}</em>
              </li>
            `).join('')}
          </ul>
          
          <h2>🧪 Recommended Tests</h2>
          <ul>
            ${diagnosisResult.tests.map(test => `
              <li>
                <strong>${test.name}</strong>
                ${test.purpose ? `<br><em>Purpose: ${test.purpose}</em>` : ''}
                ${test.urgency ? `<br><span class="badge ${test.urgency.toLowerCase()}">Urgency: ${test.urgency}</span>` : ''}
              </li>
            `).join('')}
          </ul>
          
          <h2>💊 Treatment Recommendations</h2>
          <ul>
            ${diagnosisResult.treatments.map(treatment => `
              <li>
                <strong>${treatment.action}</strong>
                ${treatment.explanation ? `<br><em>${treatment.explanation}</em>` : ''}
              </li>
            `).join('')}
          </ul>
          
          ${diagnosisResult.warningsSigns && diagnosisResult.warningsSigns.length > 0 ? `
            <div class="warning">
              <h2>🚨 When to See a Doctor</h2>
              <ul>
                ${diagnosisResult.warningsSigns.map(warning => `<li>${warning}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <h2>🧠 Medical Reasoning</h2>
          <ul>
            ${diagnosisResult.reasoningTree.map(reason => `<li>${reason}</li>`).join('')}
          </ul>
          
          <div style="margin-top: 30px; font-size: 12px; color: #6b7280;">
            <p><strong>Important Notice:</strong> This AI-powered analysis is not a substitute for professional medical advice. Always consult with a healthcare professional for proper diagnosis and treatment.</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const getLikelihoodColor = (confidence: {level: string; percentage?: number}) => {
    switch (confidence.level) {
      case "High":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "Low":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getUrgencyIcon = (urgency: string = "Medium") => {
    switch (urgency) {
      case "High":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "Medium":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "Low":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Smart Diagnosis</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered comprehensive symptom analysis with medical history consideration
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Comprehensive Health Assessment</CardTitle>
            <CardDescription>
              Provide detailed information for the most accurate analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Who is this assessment for?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="self" id="self" />
                            <Label htmlFor="self" className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Myself
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" />
                            <Label htmlFor="other" className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Someone else
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter age"
                            {...field}
                            readOnly={watchCategory === "self" && userProfile}
                          />
                        </FormControl>
                        <FormDescription>
                          {watchCategory === "self" && userProfile ? "Auto-filled from your profile" : "Age in years"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="previousConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous Medical Conditions</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., diabetes, hypertension..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Any chronic conditions or past medical history
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allergies</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., penicillin, peanuts..."
                            {...field}
                            readOnly={watchCategory === "self" && userProfile}
                          />
                        </FormControl>
                        <FormDescription>
                          {watchCategory === "self" && userProfile ? "Auto-filled from your profile" : "Known allergies"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Medications</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., aspirin 81mg daily..."
                            {...field}
                            readOnly={watchCategory === "self" && userProfile}
                          />
                        </FormControl>
                        <FormDescription>
                          {watchCategory === "self" && userProfile ? "Auto-filled from your profile" : "Current medications and dosages"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Symptoms
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                          className={isRecording ? "bg-red-50 border-red-200" : ""}
                        >
                          {isRecording ? (
                            <>
                              <MicOff className="h-4 w-4 mr-1 text-red-500" />
                              Stop Recording
                            </>
                          ) : (
                            <>
                              <Mic className="h-4 w-4 mr-1" />
                              Voice Input
                            </>
                          )}
                        </Button>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe symptoms in detail: when they started, severity, triggers, etc. You can also use voice input..."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include onset, duration, severity, and any patterns you've noticed. Use voice input for hands-free entry.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Comprehensive Health Data...
                    </>
                  ) : (
                    "Analyze Symptoms & Health Data"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {diagnosisResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Comprehensive Diagnosis Results</CardTitle>
                <CardDescription>
                  AI-powered analysis considering symptoms, age, medical history, and current medications
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="conditions">
                  <TabsList className="w-full grid grid-cols-4 rounded-none">
                    <TabsTrigger value="conditions">Conditions</TabsTrigger>
                    <TabsTrigger value="tests">Tests</TabsTrigger>
                    <TabsTrigger value="treatments">Treatments</TabsTrigger>
                    <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
                  </TabsList>
                  
                  <div className="p-4">
                    <TabsContent value="conditions" className="mt-0 space-y-4">
                      {diagnosisResult.conditions.map((condition, index) => (
                        <div key={index} className="border rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{condition.name}</h3>
                            <Badge className={getLikelihoodColor(condition.confidence)}>
                              {condition.confidence.level} {condition.confidence.percentage ? `(${condition.confidence.percentage}%)` : ''}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {condition.reasoning}
                          </p>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="tests" className="mt-0 space-y-4">
                      {diagnosisResult.tests.map((test, index) => (
                        <div key={index} className="border rounded-md p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{test.name}</h3>
                              {test.purpose && (
                                <p className="text-sm text-muted-foreground">{test.purpose}</p>
                              )}
                            </div>
                            {test.urgency && (
                              <div className="flex items-center">
                                {getUrgencyIcon(test.urgency)}
                                <span className="text-sm ml-1">{test.urgency}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="treatments" className="mt-0 space-y-4">
                      <div className="space-y-3">
                        {diagnosisResult.treatments.map((treatment, index) => (
                          <div key={index} className="border rounded-md p-3">
                            <div className="flex items-baseline">
                              <span className="text-primary mr-2">•</span>
                              <div>
                                <span className="font-medium">{treatment.action}</span>
                                {treatment.explanation && (
                                  <p className="text-sm text-muted-foreground mt-1">{treatment.explanation}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {diagnosisResult.warningsSigns && diagnosisResult.warningsSigns.length > 0 && (
                        <div className="border-t pt-3 mt-3">
                          <h4 className="text-sm font-semibold mb-2 flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                            When to See a Doctor
                          </h4>
                          <ul className="space-y-1">
                            {diagnosisResult.warningsSigns.map((warning, index) => (
                              <li key={index} className="text-sm flex items-baseline">
                                <span className="text-red-500 mr-2">•</span>
                                <span>{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="reasoning" className="mt-0">
                      <div className="space-y-4">
                        <div className="border rounded-md p-4">
                          <h3 className="font-medium mb-2">Medical Reasoning</h3>
                          <ul className="space-y-2">
                            {diagnosisResult.reasoningTree.map((reason, index) => (
                              <li key={index} className="flex items-baseline">
                                <span className="mr-2 text-primary">→</span>
                                <span className="text-sm">{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <Alert>
                          <AlertTitle>Important Notice</AlertTitle>
                          <AlertDescription className="text-sm">
                            This AI-powered analysis considers your medical history and current medications. 
                            However, it is not a substitute for professional medical advice.
                            Always consult with a healthcare professional for proper diagnosis and treatment.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => form.reset()}>
                  New Assessment
                </Button>
                <Button onClick={generatePDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF Report
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Diagnosis;