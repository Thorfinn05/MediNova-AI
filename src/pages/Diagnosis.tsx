
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle2, Clock, Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, doc, addDoc, serverTimestamp } from "firebase/firestore";
import GeminiService from "@/services/GeminiService";
import { toast as sonnerToast } from "sonner";

const diagnosisSchema = z.object({
  symptoms: z.string().min(10, "Please describe your symptoms in more detail"),
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
  const { toast } = useToast();

  const form = useForm<DiagnosisFormValues>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: {
      symptoms: "",
    },
  });

  const parseConditionsFromResponse = (response: string) => {
    try {
      const conditions = [];
      console.log("Parsing conditions from:", response);
      
      // More robust parsing with multiple patterns
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
            // Extract confidence if present
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
      
      // Fallback if no conditions found
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
            // Try to extract purpose and urgency
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
      
      // Fallback if no tests found
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
      
      // Parse treatments
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
      
      // Parse warning signs
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
      
      // Fallbacks
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
      
      // Fallback
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

  const runDiagnosis = async (symptoms: string) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setDiagnosisResult(null); // Clear previous results
      
      // Single comprehensive analysis call
      sonnerToast.loading("Analyzing symptoms...");
      const response = await GeminiService.analyzeSymptoms(symptoms, "symptoms");
      console.log("Full Gemini response:", response);
      
      // Parse all sections from the single response
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
      sonnerToast.dismiss(); // Dismiss the loading toast
      sonnerToast.success("Analysis complete");
      
      // Save diagnosis to Firestore
      if (currentUser) {
        const diagnosisData = {
          symptoms,
          result,
          createdAt: serverTimestamp(),
          userId: currentUser.uid,
          userRole,
          status: "completed",
          summary: `Analysis of symptoms: ${symptoms.substring(0, 100)}...`,
        };
        
        try {
          const sessionsRef = collection(db, "diagnoses", currentUser.uid, "sessions");
          await addDoc(sessionsRef, diagnosisData);
          
          toast({
            title: "Diagnosis saved",
            description: "Your diagnosis results have been saved to your account.",
          });
        } catch (firestoreError) {
          console.error("Failed to save to Firestore:", firestoreError);
        }
      }
      
    } catch (err: any) {
      console.error("Diagnosis error:", err);
      setError("An error occurred during the diagnosis process. Please try again later.");
      sonnerToast.dismiss(); // Dismiss the loading toast
      sonnerToast.error(`Diagnosis failed: ${err.message || "Could not complete the analysis. Please try again."}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = async (data: DiagnosisFormValues) => {
    await runDiagnosis(data.symptoms);
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
          <h1>🩺 Diagnosis Report</h1>
          
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
          AI-powered symptom analysis and health recommendations
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Symptom Assessment</CardTitle>
            <CardDescription>
              Describe your symptoms in detail for the most accurate analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symptoms</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your symptoms, when they started, and any relevant health information..."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include when symptoms started, severity, and any triggers you've noticed.
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
                      Analyzing Symptoms...
                    </>
                  ) : (
                    "Analyze Symptoms"
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
                <CardTitle className="text-xl">Diagnosis Results</CardTitle>
                <CardDescription>
                  AI-powered analysis based on your reported symptoms
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
                            This AI-powered analysis is not a substitute for professional medical advice.
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
                  New Diagnosis
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
