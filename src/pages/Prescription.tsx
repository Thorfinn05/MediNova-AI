import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, FileImage, Loader2, UploadCloud, Pill, Download } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import GeminiService from "@/services/GeminiService";

interface Medicine {
  name: string;
  dosage: string;
  alternative: string;
  price: string;
}

interface PrescriptionAnalysis {
  medicines: Medicine[];
  diagnosis: string;
  doctorAdvice: string;
}

const Prescription = () => {
  const { currentUser } = useAuth();
  const { id } = useParams();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PrescriptionAnalysis | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please select an image (JPG, PNG) or PDF file');
      return;
    }
    
    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    
    // Create preview for images only
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null); // No preview for PDFs
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(droppedFile.type)) {
      toast.error('Please drop an image (JPG, PNG) or PDF file');
      return;
    }
    
    setFile(droppedFile);
    setError(null);
    
    // Create preview for images only
    if (droppedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    } else {
      setPreviewUrl(null); // No preview for PDFs
    }
  };
  
  const parsePrescriptionAnalysis = (response: string): PrescriptionAnalysis => {
    try {
      const medicines: Medicine[] = [];
      const medicinesSection = response.match(/🧾 Medicines:([\s\S]*?)(?=- 🔍 Diagnosis|$)/);
      
      if (medicinesSection && medicinesSection[1]) {
        const medicinesText = medicinesSection[1].trim();
        const medicineBlocks = medicinesText.split('•').filter(block => block.trim().length > 0);
        
        for (const block of medicineBlocks) {
          const nameMatch = block.match(/([^–\n]+)(?:–\s*([^\n]+))?/);
          const alternativeMatch = block.match(/↪ Alternative:\s*([^\n]+)/);
          const priceMatch = block.match(/💰 Price:\s*([^\n]+)/);
          
          if (nameMatch) {
            medicines.push({
              name: nameMatch[1]?.trim() || '',
              dosage: nameMatch[2]?.trim() || '',
              alternative: alternativeMatch ? alternativeMatch[1]?.trim() : '',
              price: priceMatch ? priceMatch[1]?.trim() : ''
            });
          }
        }
      }
      
      const diagnosisMatch = response.match(/🔍 Diagnosis\/Condition:\s*([^\n]+)/);
      const adviceMatch = response.match(/📋 Doctor's Advice:\s*([^\n]+)/);
      
      return {
        medicines,
        diagnosis: diagnosisMatch ? diagnosisMatch[1].trim() : '',
        doctorAdvice: adviceMatch ? adviceMatch[1].trim() : ''
      };
    } catch (error) {
      console.error("Error parsing prescription analysis:", error);
      throw new Error("Failed to parse prescription analysis");
    }
  };
  
  const generatePDF = () => {
    if (!analysis) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription Analysis Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0891b2; padding-bottom: 20px; }
            .header h1 { color: #0891b2; margin: 0; }
            .header p { color: #666; margin: 5px 0; }
            .section { margin: 20px 0; }
            .section h2 { color: #0891b2; border-bottom: 1px solid #0891b2; padding-bottom: 5px; }
            .medicine-item { margin: 15px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
            .medicine-name { font-weight: bold; font-size: 16px; color: #111827; }
            .medicine-detail { margin: 5px 0; font-size: 14px; }
            .label { font-weight: bold; color: #374151; }
            .diagnosis-box, .advice-box { padding: 15px; margin: 10px 0; border-radius: 8px; }
            .diagnosis-box { background-color: #f0f9ff; border-left: 4px solid #0891b2; }
            .advice-box { background-color: #f0fdf4; border-left: 4px solid #16a34a; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🧾 Prescription Analysis Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <p>Powered by MediNova AI</p>
          </div>
          
          <div class="section">
            <h2>💊 Medicines (${analysis.medicines.length})</h2>
            ${analysis.medicines.map(medicine => `
              <div class="medicine-item">
                <div class="medicine-name">${medicine.name}</div>
                ${medicine.dosage ? `<div class="medicine-detail"><span class="label">Dosage:</span> ${medicine.dosage}</div>` : ''}
                ${medicine.alternative ? `<div class="medicine-detail"><span class="label">Alternative:</span> ${medicine.alternative}</div>` : ''}
                ${medicine.price ? `<div class="medicine-detail"><span class="label">Price:</span> ${medicine.price}</div>` : ''}
              </div>
            `).join('')}
          </div>
          
          ${analysis.diagnosis ? `
            <div class="section">
              <h2>🔍 Diagnosis/Condition</h2>
              <div class="diagnosis-box">${analysis.diagnosis}</div>
            </div>
          ` : ''}
          
          ${analysis.doctorAdvice ? `
            <div class="section">
              <h2>📋 Doctor's Advice</h2>
              <div class="advice-box">${analysis.doctorAdvice}</div>
            </div>
          ` : ''}
          
          <div class="footer">
            <p><strong>⚠️ Important Notice:</strong> This AI-powered analysis is not a substitute for professional medical advice. Always consult with your doctor or pharmacist.</p>
            <p>Report generated by MediNova - AI-Powered Medical Assistant</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };
  
  const analyzePrescription = async () => {
    if (!file) {
      setError("Please select a file to analyze");
      return;
    }
    
    if (!currentUser) {
      setError("You must be logged in to analyze prescriptions");
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null); // Clear previous results
    
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      // Send to Gemini for analysis
      const response = await GeminiService.analyzePrescription(base64);
      console.log("Gemini prescription analysis response:", response);
      
      // Parse the response into a structured format
      const parsedAnalysis = parsePrescriptionAnalysis(response);
      setAnalysis(parsedAnalysis);
      
      // Save to Firestore
      if (currentUser) {
        const prescriptionData = {
          createdAt: serverTimestamp(),
          userId: currentUser.uid,
          title: "Prescription Analysis",
          summary: `Analysis of ${parsedAnalysis.medicines.length} medicines${parsedAnalysis.diagnosis ? ` for ${parsedAnalysis.diagnosis}` : ''}`,
          result: parsedAnalysis,
          originalResponse: response,
          status: "completed",
          imageUrl: previewUrl
        };
        
        const sessionsRef = collection(db, "prescriptions", currentUser.uid, "sessions");
        const docRef = await addDoc(sessionsRef, prescriptionData);
        console.log("Prescription analysis saved with ID:", docRef.id);
        
        toast.success("Prescription successfully analyzed");
      }
    } catch (error: any) {
      console.error("Error analyzing prescription:", error);
      setError(error.message || "Failed to analyze prescription");
      toast.error(`Analysis failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prescription Analyzer</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered prescription analysis and alternative medication finder
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Upload Prescription</CardTitle>
            <CardDescription>
              Upload a prescription image or PDF to analyze
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('prescription-upload')?.click()}
            >
              <Input 
                type="file" 
                id="prescription-upload" 
                className="hidden" 
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="rounded-full bg-primary/10 p-3">
                  <UploadCloud className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Drag and drop or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports JPG, PNG, or PDF files (max 5MB)
                  </p>
                </div>
              </div>
            </div>
            
            {previewUrl && (
              <div className="mt-4">
                <Label className="text-sm font-medium">Preview</Label>
                <div className="mt-2 border rounded-md overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Prescription preview" 
                    className="w-full max-h-64 object-contain"
                  />
                </div>
              </div>
            )}
            
            {file && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileImage className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    setAnalysis(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={analyzePrescription}
              disabled={!file || isAnalyzing}
              className="bg-gradient-to-r from-teal-600 to-azure-600 text-white hover:opacity-90"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Prescription'
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Analysis Results</CardTitle>
                <CardDescription>
                  AI-powered prescription analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="medicines">
                  <TabsList className="w-full grid grid-cols-2 rounded-none">
                    <TabsTrigger value="medicines">Medicines</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                  </TabsList>
                  
                  <div className="p-4">
                    <TabsContent value="medicines" className="mt-0">
                      <div className="space-y-4">
                        {analysis.medicines.map((medicine, index) => (
                          <div key={index} className="border rounded-md p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium">{medicine.name}</h3>
                              {medicine.dosage && (
                                <Badge variant="outline">
                                  {medicine.dosage}
                                </Badge>
                              )}
                            </div>
                            <div className="mt-3 space-y-2">
                              {medicine.alternative && (
                                <div className="flex items-start text-sm">
                                  <span className="font-medium mr-2 w-24">Alternative:</span>
                                  <span className="text-muted-foreground">{medicine.alternative}</span>
                                </div>
                              )}
                              {medicine.price && (
                                <div className="flex items-start text-sm">
                                  <span className="font-medium mr-2 w-24">Price:</span>
                                  <span className="text-muted-foreground">{medicine.price}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="summary" className="mt-0">
                      <div className="space-y-4">
                        {analysis.diagnosis && (
                          <div className="border rounded-md p-4">
                            <h3 className="font-medium mb-1">Diagnosis/Condition</h3>
                            <p className="text-sm text-muted-foreground">
                              {analysis.diagnosis}
                            </p>
                          </div>
                        )}
                        
                        {analysis.doctorAdvice && (
                          <div className="border rounded-md p-4">
                            <h3 className="font-medium mb-1">Doctor's Advice</h3>
                            <p className="text-sm text-muted-foreground">
                              {analysis.doctorAdvice}
                            </p>
                          </div>
                        )}
                        
                        <Alert className="bg-primary/5">
                          <Check className="h-4 w-4" />
                          <AlertTitle>Important Notice</AlertTitle>
                          <AlertDescription className="text-sm">
                            This AI-powered analysis is not a substitute for professional medical advice.
                            Always consult with your doctor or pharmacist.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    setAnalysis(null);
                  }}
                >
                  New Analysis
                </Button>
                <Button 
                  onClick={generatePDF}
                  className="bg-gradient-to-r from-teal-600 to-azure-600 text-white hover:opacity-90"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Prescription;
