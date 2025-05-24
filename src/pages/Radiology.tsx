
import { useState, useRef, ChangeEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { 
  Loader2, 
  Upload, 
  AlertCircle, 
  Download, 
  Image,
  X
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast as sonnerToast } from "sonner";
import GeminiService from "@/services/GeminiService";

interface RadiologyResult {
  findings: string[];
  conditions: string[];
  recommendedTests: string[];
  impression: string;
}

const Radiology = () => {
  const { currentUser, userRole } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [radiologyResult, setRadiologyResult] = useState<RadiologyResult | null>(null);
  const [description, setDescription] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
      });
      return;
    }
    
    setSelectedFile(file);
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    setRadiologyResult(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
      });
      return;
    }
    
    setSelectedFile(file);
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    setRadiologyResult(null);
  };

  // Improved parsing with better fallbacks
  const parseRadiologyResponse = (response: string): RadiologyResult => {
    try {
      console.log("Parsing radiology response:", response);
      
      const findings: string[] = [];
      const conditions: string[] = [];
      const recommendedTests: string[] = [];
      let impression = "";
      
      // Extract findings with multiple patterns
      const findingsPatterns = [
        /✅\s*Findings:?\s*([\s\S]*?)(?=🩺|🧪|📋|$)/i,
        /Findings:?\s*([\s\S]*?)(?=Conditions?|Interpretation|Tests?|Impression|$)/i
      ];
      
      for (const pattern of findingsPatterns) {
        const match = response.match(pattern);
        if (match) {
          const lines = match[1].trim().split('\n').filter(line => 
            line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')
          );
          for (const line of lines) {
            const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
            if (cleaned) findings.push(cleaned);
          }
          break;
        }
      }
      
      // Extract conditions
      const conditionsPatterns = [
        /🩺\s*(?:Possible\s*)?Conditions?(?:\/Interpretation)?:?\s*([\s\S]*?)(?=🧪|📋|$)/i,
        /(?:Possible\s*)?Conditions?:?\s*([\s\S]*?)(?=Tests?|Impression|$)/i
      ];
      
      for (const pattern of conditionsPatterns) {
        const match = response.match(pattern);
        if (match) {
          const lines = match[1].trim().split('\n').filter(line => 
            line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')
          );
          for (const line of lines) {
            const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
            if (cleaned) conditions.push(cleaned);
          }
          break;
        }
      }
      
      // Extract tests
      const testsPatterns = [
        /🧪\s*(?:Recommended\s*(?:Follow-up\s*)?)?Tests?:?\s*([\s\S]*?)(?=📋|$)/i,
        /(?:Recommended\s*)?Tests?:?\s*([\s\S]*?)(?=Impression|$)/i
      ];
      
      for (const pattern of testsPatterns) {
        const match = response.match(pattern);
        if (match) {
          const lines = match[1].trim().split('\n').filter(line => 
            line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')
          );
          for (const line of lines) {
            const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
            if (cleaned) recommendedTests.push(cleaned);
          }
          break;
        }
      }
      
      // Extract impression
      const impressionPatterns = [
        /📋\s*(?:Radiologist(?:-Style)?\s*)?Impression:?\s*([\s\S]*?)(?=\n\s*\n|$)/i,
        /Impression:?\s*([\s\S]*?)(?=\n\s*\n|$)/i
      ];
      
      for (const pattern of impressionPatterns) {
        const match = response.match(pattern);
        if (match) {
          impression = match[1].trim();
          break;
        }
      }
      
      // Fallbacks if sections are empty
      if (findings.length === 0) {
        findings.push("No significant abnormalities detected on initial review");
      }
      if (conditions.length === 0) {
        conditions.push("Normal chest X-ray appearance");
      }
      if (recommendedTests.length === 0) {
        recommendedTests.push("Clinical correlation recommended");
      }
      if (!impression) {
        impression = "Radiological findings require clinical correlation for complete assessment";
      }
      
      console.log("Parsed radiology result:", { findings, conditions, recommendedTests, impression });
      
      return {
        findings,
        conditions,
        recommendedTests,
        impression
      };
    } catch (error) {
      console.error("Error parsing radiology response:", error);
      return {
        findings: ["Error parsing radiological findings"],
        conditions: ["Unable to determine condition from analysis"],
        recommendedTests: ["Consult a radiologist for proper evaluation"],
        impression: "Could not parse results accurately. Please consult a medical professional."
      };
    }
  };

  const runAnalysis = async () => {
    if (!selectedFile || !previewUrl) return;
    
    try {
      setIsAnalyzing(true);
      setRadiologyResult(null); // Clear previous results
      sonnerToast.loading("Analyzing X-ray...");
      
      // Convert image to base64
      const base64Image = await fileToBase64(previewUrl);
      
      // Call Gemini API to analyze the image
      const response = await GeminiService.analyzeImage(base64Image, description);
      console.log("Gemini API response:", response);
      
      // Parse the response
      const result = parseRadiologyResponse(response);
      setRadiologyResult(result);
      
      sonnerToast.dismiss(); // Dismiss the loading toast
      sonnerToast.success("Analysis complete");
      
      // Save to Firestore if user is logged in
      if (currentUser) {
        const radiologyData = {
          imageURL: null, // We don't store the actual image for privacy
          result,
          createdAt: serverTimestamp(),
          userId: currentUser.uid,
          userRole,
          status: "completed",
          summary: `Radiology analysis: ${result.impression}`,
        };
        
        try {
          const radiologyRef = collection(db, "radiology", currentUser.uid, "sessions");
          await addDoc(radiologyRef, radiologyData);
          console.log("Radiology results saved to Firestore");
        } catch (firestoreError) {
          console.error("Failed to save to Firestore:", firestoreError);
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);
      sonnerToast.dismiss(); // Dismiss the loading toast
      sonnerToast.error("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        const reader = new FileReader();
        reader.onloadend = function() {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.open('GET', url);
      xhr.responseType = 'blob';
      xhr.onerror = () => {
        reject(new Error("Failed to convert image to base64"));
      };
      xhr.send();
    });
  };

  const resetImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setRadiologyResult(null);
    setDescription("");
    setIsAnalyzing(false); // Ensure loading state is cleared
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generatePDF = () => {
    if (!radiologyResult) return;
    
    // Create a new window with only the radiology results
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Radiology Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 20px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 5px; }
            .impression { background: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0; font-weight: 500; }
            .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 10px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <h1>🩻 Radiology Report</h1>
          
          <h2>✅ Radiological Findings</h2>
          <ul>
            ${radiologyResult.findings.map(finding => `<li>${finding}</li>`).join('')}
          </ul>
          
          <h2>🩺 Possible Conditions</h2>
          <ul>
            ${radiologyResult.conditions.map(condition => `<li>${condition}</li>`).join('')}
          </ul>
          
          <h2>🧪 Recommended Follow-up</h2>
          <ul>
            ${radiologyResult.recommendedTests.map(test => `<li>${test}</li>`).join('')}
          </ul>
          
          <div class="impression">
            <h2>📋 Radiologist Impression</h2>
            <p>${radiologyResult.impression}</p>
          </div>
          
          <div class="warning">
            <h2>🚨 Medical Disclaimer</h2>
            <p>This AI analysis is meant to assist healthcare professionals and should not replace clinical judgment. Results should be verified by a qualified radiologist.</p>
          </div>
          
          <div style="margin-top: 30px; font-size: 12px; color: #6b7280;">
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

  const getSeverityColor = (condition: string): string => {
    const severeConditions = ["pneumonia", "tuberculosis", "tumor", "cancer", "edema", "effusion", "fracture"];
    const moderateConditions = ["atelectasis", "consolidation", "infiltrate", "opacity"];
    
    for (const keyword of severeConditions) {
      if (condition.toLowerCase().includes(keyword)) {
        return "text-red-600";
      }
    }
    
    for (const keyword of moderateConditions) {
      if (condition.toLowerCase().includes(keyword)) {
        return "text-yellow-600";
      }
    }
    
    return "text-green-600";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Radiology Assistant</h1>
        <p className="text-muted-foreground mt-1">
          Upload and analyze radiology images with AI-powered annotations
        </p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Image Upload</CardTitle>
            <CardDescription>
              Upload an X-ray image for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className={`
                border-2 border-dashed rounded-lg p-8
                flex flex-col items-center justify-center text-center
                ${!selectedFile ? 'border-primary/20 hover:border-primary/50 cursor-pointer' : 'border-primary/50'}
                transition-all duration-200
              `}
              onDragOver={handleDragOver}
              onDrop={!selectedFile ? handleDrop : undefined}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
            >
              {!selectedFile ? (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mb-3" />
                  <h3 className="text-sm font-medium mb-1">Upload Radiology Image</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Drag and drop or click to browse
                  </p>
                  <Button size="sm" onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}>
                    Select File
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    placeholder="Select a radiology image"
                    title="Select a radiology image"
                  />
                </>
              ) : (
                <div className="w-full">
                  <div className="relative aspect-square max-h-48 overflow-hidden rounded-md mb-3">
                    <img 
                      src={previewUrl || ""} 
                      alt="Uploaded radiography" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <textarea
                    className="w-full p-2 border rounded-md mb-3 text-xs"
                    placeholder="Optional: Add patient context or symptoms"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                  <div className="flex justify-between gap-2">
                    <Button variant="outline" size="sm" onClick={resetImage}>
                      <X className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                    <Button size="sm" onClick={runAnalysis} disabled={isAnalyzing}>
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Image className="h-3 w-3 mr-1" />
                          Analyze
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {previewUrl && radiologyResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Analysis Results</CardTitle>
                <CardDescription>
                  AI-powered radiological findings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="findings">
                  <TabsList className="w-full grid grid-cols-2 rounded-none">
                    <TabsTrigger value="findings">Findings</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  </TabsList>
                  
                  <div className="p-4">
                    <TabsContent value="findings" className="mt-0 space-y-4">
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-2 flex items-center">
                          <span className="text-primary mr-2">✅</span>
                          Radiological Findings
                        </h3>
                        <ul className="space-y-1">
                          {radiologyResult.findings.map((finding, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-baseline">
                              <span className="mr-2">•</span>
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-2 flex items-center">
                          <span className="text-primary mr-2">🩺</span>
                          Possible Conditions
                        </h3>
                        <ul className="space-y-1">
                          {radiologyResult.conditions.map((condition, idx) => (
                            <li key={idx} className={`text-sm flex items-baseline ${getSeverityColor(condition)}`}>
                              <span className="mr-2">•</span>
                              <span>{condition}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-2 flex items-center">
                          <span className="text-primary mr-2">📋</span>
                          Radiologist Impression
                        </h3>
                        <p className="text-sm font-medium">
                          {radiologyResult.impression}
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="recommendations" className="mt-0 space-y-4">
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-2 flex items-center">
                          <span className="text-primary mr-2">🧪</span>
                          Recommended Follow-up
                        </h3>
                        <ul className="space-y-1">
                          {radiologyResult.recommendedTests.map((test, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-baseline">
                              <span className="mr-2">•</span>
                              <span>{test}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Medical Disclaimer</AlertTitle>
                        <AlertDescription className="text-sm">
                          This AI analysis is meant to assist healthcare professionals and should
                          not replace clinical judgment. Results should be verified by a qualified radiologist.
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={resetImage}>
                  New Analysis
                </Button>
                <Button onClick={generatePDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {!previewUrl && (
            <div className="flex flex-col items-center justify-center text-center h-64 border-2 border-dashed border-muted-foreground/20 rounded-lg">
              <Image className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Image Selected</h3>
              <p className="text-sm text-muted-foreground">
                Upload a radiology image to get started with AI analysis
              </p>
            </div>
          )}
          
          {previewUrl && !radiologyResult && !isAnalyzing && (
            <div className="flex flex-col items-center justify-center text-center h-64 border-2 border-dashed border-primary/20 rounded-lg">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Image Ready for Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click "Analyze" to begin the AI-powered assessment
              </p>
              <Button onClick={runAnalysis}>
                <Image className="h-4 w-4 mr-2" />
                Analyze Image
              </Button>
            </div>
          )}
          
          {previewUrl && isAnalyzing && (
            <div className="flex flex-col items-center justify-center text-center h-64">
              <Loader2 className="h-16 w-16 text-primary mb-4 animate-spin" />
              <h3 className="text-lg font-medium mb-2">Analyzing Image</h3>
              <p className="text-sm text-muted-foreground">
                AI is processing your radiology image and generating findings
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Radiology;
