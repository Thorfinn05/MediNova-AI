import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Shield, Tablets, Brain, TestTube, Pill, FileImage, ScrollText } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Landing = () => {
  const navigate = useNavigate();

  // Smooth scroll for anchor links
  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href') || '');
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth'
          });
        }
      });
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-azure-50 to-background dark:from-azure-950/30 dark:to-background z-0"></div>
        
        {/* Floating circles decoration */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-teal-300/10 dark:bg-teal-500/10 blur-3xl"></div>
        <div className="absolute bottom-10 left-20 w-80 h-80 rounded-full bg-azure-300/10 dark:bg-azure-500/10 blur-3xl"></div>
        
        <div className="container mx-auto px-6 z-10 flex flex-col md:flex-row items-center justify-between">
          {/* Left content */}
          <div className="flex-1 text-center md:text-left md:pr-10 mb-10 md:mb-0 animate-fade-in">
            <Badge variant="outline" className="mb-4 bg-background/50 backdrop-blur-sm border-azure-200 dark:border-azure-800 px-3 py-1">
              <span className="mr-1 text-azure-500">✨</span> AI-Powered Healthcare Platform
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gradient mb-6">
              Smarter Diagnosis.<br />Safer Care.
            </h1>
            
            <p className="text-lg md:text-xl text-foreground/80 dark:text-foreground/70 max-w-2xl mb-8">
              Powered by AI agents and radiology intelligence, MediNova brings clarity and precision to your health with AI technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="modern-gradient hover:opacity-90 text-white shadow-md"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  const featuresSection = document.getElementById('features');
                  featuresSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-azure-200 hover:bg-azure-50 dark:border-azure-800 dark:hover:bg-azure-900/30"
              >
                Learn More
              </Button>
            </div>
          </div>
          
          {/* Right illustration */}
          <div className="flex-1 flex justify-center md:justify-end animate-fade-in">
            <div className="relative w-full max-w-lg">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-teal-400/20 dark:bg-teal-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-azure-400/20 dark:bg-azure-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
              
              <div className="relative glass dark:bg-gray-800/70 p-8 rounded-2xl shadow-xl border border-white/20 dark:border-white/10">
                <div className="text-3xl font-bold mb-6 text-gradient">MediNova AI</div>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 mr-4">
                      <Brain className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Smart Diagnosis</h3>
                      <p className="text-sm text-muted-foreground">AI-powered symptom analysis</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-azure-500/20 flex items-center justify-center text-azure-600 dark:text-azure-400 mr-4">
                      <FileImage className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Radiology Assistant</h3>
                      <p className="text-sm text-muted-foreground">Vision AI image analysis</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 mr-4">
                      <Tablets className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Prescription Analyzer</h3>
                      <p className="text-sm text-muted-foreground">AI-powered Prescription Analyzer</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Privacy Focused</h3>
                      <p className="text-sm text-muted-foreground">Secure health insights</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      {/* <section id="how-it-works" className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-teal-200 dark:border-teal-800">
              <span className="mr-1 text-teal-500">🔍</span> Our Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient">
              How MediNova Works
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Our multi-agent system leverages Gemini 2.0 Flash to provide comprehensive healthcare analysis
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="group relative">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-teal-500 to-azure-500 opacity-20 blur-sm group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-card rounded-lg p-6 h-full flex flex-col items-center text-center shadow-sm border border-border">
                <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-3">Symptom Analyzer</h3>
                <p className="text-muted-foreground text-sm">
                  Advanced AI analyzes symptoms and medical history to identify potential conditions.
                </p>
              </div>
            </div>
            
            
            <div className="group relative">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-teal-500 to-azure-500 opacity-20 blur-sm group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-card rounded-lg p-6 h-full flex flex-col items-center text-center shadow-sm border border-border">
                <div className="w-12 h-12 rounded-full bg-azure-500/20 flex items-center justify-center text-azure-600 dark:text-azure-400 mb-4">
                  <TestTube className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-3">Treatment & Test Recommender</h3>
                <p className="text-muted-foreground text-sm">
                  Suggests relevant diagnostic tests and evidence-based treatment options based on symptoms and possible conditions.
                </p>
              </div>
            </div>
            
           
            <div className="group relative">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-teal-500 to-azure-500 opacity-20 blur-sm group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-card rounded-lg p-6 h-full flex flex-col items-center text-center shadow-sm border border-border">
                <div className="w-12 h-12 rounded-full bg-azure-500/20 flex items-center justify-center text-azure-600 dark:text-azure-400 mb-4">
                  <FileImage className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-3">Image Annotator & Radiology Assist</h3>
                <p className="text-muted-foreground text-sm">
                  Computer Vision analyze and annotate medical images, medical scans for diagnostic assistance.
                </p>
              </div>
            </div>

           
            <div className="group relative">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-teal-500 to-azure-500 opacity-20 blur-sm group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-card rounded-lg p-6 h-full flex flex-col items-center text-center shadow-sm border border-border">
                <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4">
                  <Pill className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-3">Prescription Analyzer</h3>
                <p className="text-muted-foreground text-sm">
                  AI-powered analysis of prescriptions to ensure accuracy and adherence to treatment plans. Also suggestion of alternative medications with pricing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section> */}
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-azure-50/50 dark:bg-azure-950/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-azure-200 dark:border-azure-800">
              <span className="mr-1 text-azure-500">✨</span> Key Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient">
              Healthcare Reimagined with AI
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge technology meets intuitive design for better healthcare outcomes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border border-azure-100 dark:border-azure-900 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-xl hover:shadow-azure-100/20 dark:hover:shadow-azure-900/20 transition-shadow duration-300">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-teal-500/20 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <CardTitle>Advanced Diagnosis</CardTitle>
                <CardDescription>Multi-agent AI system powered by Gemini 2.0 Flash</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our multi-agent AI system analyzes symptoms, suggests tests, and provides treatment recommendations using state-of-the-art Gemini 2.0 Flash technology.
                </p>
              </CardContent>
            </Card>
            
            {/* Feature 2 */}
            <Card className="border border-azure-100 dark:border-azure-900 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-xl hover:shadow-azure-100/20 dark:hover:shadow-azure-900/20 transition-shadow duration-300">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-azure-500/20 flex items-center justify-center mb-4">
                  <FileImage className="h-6 w-6 text-azure-600 dark:text-azure-400" />
                </div>
                <CardTitle>AI Radiology</CardTitle>
                <CardDescription>Vision transformers for medical imaging</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Upload medical images and receive detailed annotations and analysis powered by vision transformers and Gemini 2.0 Flash vision capabilities.
                </p>
              </CardContent>
            </Card>
            
            {/* Feature 3
            <Card className="border border-azure-100 dark:border-azure-900 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-xl hover:shadow-azure-100/20 dark:hover:shadow-azure-900/20 transition-shadow duration-300">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure & Personalized</CardTitle>
                <CardDescription>HIPAA-compliant with role-based access</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Role-based access for patients and doctors with full encryption and privacy protection for all your sensitive medical information.
                </p>
              </CardContent>
            </Card> */}

            {/* Feature 3 */}
            <Card className="border border-azure-100 dark:border-azure-900 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-xl hover:shadow-azure-100/20 dark:hover:shadow-azure-900/20 transition-shadow duration-300">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-rose-500/20 flex items-center justify-center mb-4">
                  <ScrollText className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
                <CardTitle>Prescription Analyzer</CardTitle>
                <CardDescription>AI-powered extraction & smart medicine suggestions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Upload a prescription to extract medicines and doctor's advice instantly. Our AI also suggests alternative generics with real-time pricing, making your treatment both smart and affordable.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* About Agents Section */}
      <section id="about" className="py-20 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-teal-200/20 dark:bg-teal-800/20 blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-azure-200/20 dark:bg-azure-800/20 blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-teal-200 dark:border-teal-800">
              <span className="mr-1 text-teal-500">🤖</span> AI Agents
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient">
              Meet Our Intelligent Agents
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Powered by Gemini 2.0 Flash, our specialized AI agents work together to provide comprehensive health insights
            </p>
          </div>
          
          <Tabs defaultValue="symptom" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="symptom">Symptom Analyzer</TabsTrigger>
              <TabsTrigger value="test">Test Recommender</TabsTrigger>
              <TabsTrigger value="treatment">Treatment Suggester</TabsTrigger>
              <TabsTrigger value="image">Image Annotator</TabsTrigger>
              <TabsTrigger value="prescription">Prescription Analyzer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="symptom">
              <Card className="border-azure-100 dark:border-azure-900">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center mr-3">
                      <Brain className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <CardTitle>Symptom Analyzer Agent</CardTitle>
                  </div>
                  <CardDescription>
                    Identifies possible conditions based on symptoms and medical history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Using natural language processing and medical knowledge, this agent analyzes your symptoms to identify potential conditions, considering factors like:</p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Symptom severity, duration, and progression</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Past medical history and risk factors</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Demographic information and relevant context</span>
                    </li>
                  </ul>
                  <p className="text-muted-foreground text-sm">Powered by Gemini 2.0 Flash with access to medical knowledge bases</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="test">
              <Card className="border-azure-100 dark:border-azure-900">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-azure-500/20 flex items-center justify-center mr-3">
                      <TestTube className="h-5 w-5 text-azure-600 dark:text-azure-400" />
                    </div>
                    <CardTitle>Test Recommender Agent</CardTitle>
                  </div>
                  <CardDescription>
                    Suggests appropriate diagnostic tests based on possible conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">This agent evaluates potential conditions and recommends the most appropriate diagnostic tests to confirm or rule out diagnoses:</p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-azure-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Laboratory tests (blood work, urinalysis, etc.)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-azure-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Imaging studies (X-ray, CT, MRI, ultrasound)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-azure-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Specialized procedures based on clinical indications</span>
                    </li>
                  </ul>
                  <p className="text-muted-foreground text-sm">Using Gemini 2.0 Flash to prioritize tests by diagnostic value and clinical necessity</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="treatment">
              <Card className="border-azure-100 dark:border-azure-900">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center mr-3">
                      <Pill className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <CardTitle>Treatment Suggester Agent</CardTitle>
                  </div>
                  <CardDescription>
                    Recommends evidence-based treatments for identified conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Based on the diagnosis, this agent suggests appropriate treatment options considering:</p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Medication options and therapeutic approaches</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Lifestyle modifications and self-care recommendations</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Follow-up care and monitoring requirements</span>
                    </li>
                  </ul>
                  <p className="text-muted-foreground text-sm">Gemini 2.0 Flash ensures treatments are evidence-based and clinically appropriate</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="image">
              <Card className="border-azure-100 dark:border-azure-900">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-azure-500/20 flex items-center justify-center mr-3">
                      <FileImage className="h-5 w-5 text-azure-600 dark:text-azure-400" />
                    </div>
                    <CardTitle>Image Annotator Agent</CardTitle>
                  </div>
                  <CardDescription>
                    Analyzes medical images to identify and highlight areas of interest
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Using vision transformers and Gemini 2.0 Flash vision capabilities, this agent assists with medical image interpretation:</p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-azure-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Highlights abnormalities and areas of concern</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-azure-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Provides measurements and quantitative analysis</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-azure-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Generates reports with findings and interpretations</span>
                    </li>
                  </ul>
                  <p className="text-muted-foreground text-sm">Supports various medical imaging modalities including X-ray, CT, MRI, and ultrasound</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescription">
              <Card className="border border-border shadow-md rounded-2xl">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mr-3">
                      <ScrollText className="h-5 w-5 text--600 dark:text-amber-300" />
                    </div>
                    <CardTitle>Prescription Analyzer Agent</CardTitle>
                  </div>
                  <CardDescription>
                    Extracts key details from prescriptions and suggests alternatives
                  </CardDescription>
                  {/* <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                    <ScrollText className="h-5 w-5 text--600 dark:text-amber-300" />
                  </div>amber
                  <div>
                    <CardTitle>Prescription Analyzer Agent</CardTitle>
                    <CardDescription>
                      Extracts key details from prescriptions and suggests alternatives.
                    </CardDescription>
                  </div> */}
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    This agent uses advanced OCR + NLP to read and analyze prescriptions, enabling:
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start">
                      <CheckCircle2 className="text-amber-500 mt-1 mr-2" /> Extraction of prescribed medicines, dosages, and instructions
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="text-amber-500 mt-1 mr-2" /> Identification of doctor's notes or special recommendations
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="text-amber-500 mt-1 mr-2" /> Suggestion of alternative medicines with availability and pricing
                    </li>
                  </ul>
                  <p className="text-muted-foreground text-sm">
                    Powered by Gemini 2.0 Flash and integrated with pharmacy databases for accuracy
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Security Section */}
      <section className="py-20 bg-teal-50/50 dark:bg-teal-950/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-teal-200 dark:border-teal-800">
                <span className="mr-1 text-teal-500">🛡️</span> Data Protection
              </Badge>
              <h2 className="text-3xl font-bold text-gradient">
                Security & Compliance
              </h2>
              <p className="mt-4 text-muted-foreground">
                Your health data is protected with industry-leading security measures
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start">
                <div className="mt-1 mr-4 w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">HIPAA Awareness</h3>
                  <p className="text-muted-foreground">
                    Our platform is designed with HIPAA compliance in mind. All patient data is handled according to healthcare privacy requirements.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mt-1 mr-4 w-12 h-12 rounded-full bg-azure-500/20 flex items-center justify-center text-azure-600 dark:text-azure-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Consent-First Approach</h3>
                  <p className="text-muted-foreground">
                    We only store data with explicit consent. Users maintain full control over what information is saved and shared.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mt-1 mr-4 w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">End-to-End Encryption</h3>
                  <p className="text-muted-foreground">
                    All communications between your device and our servers are encrypted, as are all Gemini API responses containing medical information.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mt-1 mr-4 w-12 h-12 rounded-full bg-azure-500/20 flex items-center justify-center text-azure-600 dark:text-azure-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
                  <p className="text-muted-foreground">
                    Our system implements strict role-based access controls, ensuring physicians and patients only see information relevant to them.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-azure-50 dark:from-teal-950/30 dark:to-azure-950/30 -z-10"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute w-96 h-96 rounded-full bg-teal-300/20 dark:bg-teal-500/10 blur-3xl -top-20 -left-20"></div>
          <div className="absolute w-96 h-96 rounded-full bg-azure-300/20 dark:bg-azure-500/10 blur-3xl -bottom-20 -right-20"></div>
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <Badge variant="outline" className="mb-6 border-azure-200 dark:border-azure-800 mx-auto">
            <span className="mr-1 text-azure-500">✨</span> Get Started Today
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">
            Ready to experience the future of healthcare?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Join MediNova today and leverage the power of AI for smarter healthcare decisions. Our platform is continually evolving with the latest advancements in medical AI.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/auth")}
            className="modern-gradient hover:opacity-90 text-white shadow-md px-8"
          >
            Start Your Health Journey <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-full flex items-center justify-center">
                  {/* <span className="text-white font-bold text-sm">M</span> */}
                  <img
                    src="/Medinova-logo.png"
                    alt="MediNova Logo"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                </div>
                <span className="font-bold text-xl text-gradient">MediNova AI</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Revolutionizing healthcare with intelligent AI-powered diagnostics and analysis.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="https://github.com/AitijhyaCoded" className="text-muted-foreground hover:text-foreground transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                </a>
                <a href="https://github.com/Thorfinn05" className="text-muted-foreground hover:text-foreground transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">API Reference</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              © {new Date().getFullYear()} MediNova. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
