import { toast } from "sonner";

// Gemini 2.0 Flash API key
const GEMINI_API_KEY = "AIzaSyD1etE0ZKYk-mQ2puvgwRhgfcnCEOUQwS4";
const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const TEXT_MODEL = "gemini-2.0-flash";
const VISION_MODEL = "gemini-2.0-flash";

interface GeminiMessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // Base64 encoded image
  };
}

interface GeminiRequestContent {
  parts: GeminiMessagePart[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
  promptFeedback?: {
    blockReason?: string;
  };
}

export class GeminiService {
  
  /**
   * Get medical advice from Aether chatbot
   */
  static async getMedicalAdvice(question: string): Promise<string> {
    try {
      const prompt = `You are Aether, a friendly medical AI assistant. You're designed to help with health and wellness questions in a warm, caring tone.

User question: "${question}"

Guidelines for your response:
- Be friendly, warm, and supportive in your tone
- If the question is health/medical related (including general wellness, mental health, nutrition, exercise, symptoms, medications, treatments, body concerns, pregnancy, child health, elderly care, preventive care, first aid, etc.), provide helpful advice
- For clearly non-medical questions (like sports scores, weather, cooking recipes, entertainment, politics), politely redirect: "I'm Aether, your medical assistant. I'm here to help with health and wellness questions. Is there anything about your health I can help you with today?"
- Structure your response with clear bullet points or numbered lists when appropriate
- Use proper paragraphs for better readability
- Always recommend consulting healthcare professionals for serious symptoms
- Suggest practical remedies and self-care tips when appropriate
- Keep responses concise but informative

Format your response with:
• Clear bullet points for lists
• Proper paragraph breaks
• Bold text for important points when needed

Please provide your response now:`;
      
      const content: GeminiRequestContent = {
        parts: [{ text: prompt }]
      };
      
      return await this.callGeminiApi(content, TEXT_MODEL);
    } catch (error: any) {
      console.error("Error in medical advice:", error);
      toast.error(`Medical advice failed: ${error.message || "Unknown error"}`);
      throw error;
    }
  }
  
  /**
   * Analyze symptoms using the Gemini 2.0 Flash model
   */
  static async analyzeSymptoms(symptoms: string, promptType: "symptoms" | "tests" | "treatments" | "reasoning"): Promise<string> {
    try {
      let prompt: string;
      
      switch (promptType) {
        case "symptoms":
          prompt = this.constructSymptomAnalyzerPrompt(symptoms);
          break;
        case "tests":
          prompt = this.constructTestRecommenderPrompt(symptoms);
          break;
        case "treatments":
          prompt = this.constructTreatmentSuggesterPrompt(symptoms);
          break;
        case "reasoning":
          prompt = this.constructReasoningTreePrompt(symptoms);
          break;
        default:
          throw new Error("Invalid prompt type");
      }
      
      const content: GeminiRequestContent = {
        parts: [{ text: prompt }]
      };
      
      return await this.callGeminiApi(content, TEXT_MODEL);
    } catch (error: any) {
      console.error(`Error in ${promptType} analysis:`, error);
      toast.error(`Analysis failed: ${error.message || "Unknown error"}`);
      throw error;
    }
  }
  
  /**
   * Analyze a medical image using Gemini 2.0 Flash Vision
   */
  static async analyzeImage(imageBase64: string, description: string = ""): Promise<string> {
    try {
      const prompt = this.constructRadiologyPrompt(description);
      
      const content: GeminiRequestContent = {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64.replace(/^data:image\/(jpeg|png|jpg);base64,/, "")
            }
          }
        ]
      };
      
      return await this.callGeminiApi(content, VISION_MODEL);
    } catch (error: any) {
      console.error("Error in image analysis:", error);
      toast.error(`Image analysis failed: ${error.message || "Unknown error"}`);
      throw error;
    }
  }
  
  /**
   * Analyze a prescription image using Gemini 2.0 Flash Vision
   */
  static async analyzePrescription(prescriptionImage: string): Promise<string> {
    try {
      const prompt = `You're a medical assistant analyzing a prescription scanned in image format. Your job is to:
      1. Extract all medicines with dosage (if mentioned).
      2. Suggest cheaper/generic alternatives for each medicine.
      3. List the approximate market price (₹) of each medicine (can be approximate).
      4. Provide a 1-line summary of the diagnosis/condition.
      5. Summarize any short doctor advice (like "Take rest", "Avoid salt", etc.).
      
      Output format:
      - 🧾 Medicines:
        • [Medicine 1] – [Dosage]  
          ↪ Alternative: [Generic name]  
          💰 Price: ₹[approx]
        • [Medicine 2] – [Dosage]  
          ↪ Alternative: ...
      
      - 🔍 Diagnosis/Condition: [Short condition or disease]
      - 📋 Doctor's Advice: [Short advice if present]
      
      Be direct, compact, medically accurate. Don't invent extra information.`;
      
      const content: GeminiRequestContent = {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: prescriptionImage.replace(/^data:image\/(jpeg|png|jpg);base64,/, "")
            }
          }
        ]
      };
      
      return await this.callGeminiApi(content, VISION_MODEL);
    } catch (error: any) {
      console.error("Error in prescription analysis:", error);
      toast.error(`Prescription analysis failed: ${error.message || "Unknown error"}`);
      throw error;
    }
  }
  
  /**
   * Call the Gemini API with the provided content
   */
  private static async callGeminiApi(content: GeminiRequestContent, model: string): Promise<string> {
    const endpoint = `${API_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contents: [content] })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API error: ${response.statusText}`);
    }
    
    const data = await response.json() as GeminiResponse;
    
    if (data.promptFeedback?.blockReason) {
      throw new Error(`Content was blocked: ${data.promptFeedback.blockReason}`);
    }
    
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content?.parts?.[0]?.text) {
      throw new Error("No valid response from the model");
    }
    
    return data.candidates[0].content.parts[0].text;
  }
  
  /**
   * Improved Symptom Analyzer prompt for consistent results
   */
  private static constructSymptomAnalyzerPrompt(symptoms: string): string {
    return `You are a clinical AI assistant trained to analyze human-reported symptoms and provide compact, medically accurate diagnostic support. A user has reported the following symptoms:

Symptoms: ${symptoms}

Your task is to analyze these symptoms and provide a compact summary under the following four sections:

---

1. ✅ **Possible Condition(s):**  
   - List the most probable medical conditions (1–2 max)  
   - Be medically responsible — don't overdiagnose or assume rare diseases unless clearly indicated

2. 🧪 **Recommended Tests:**  
   - Suggest relevant diagnostic tests (basic to advanced, if needed)  
   - Keep it concise, don't include unnecessary tests

3. 💊 **Treatment Recommendations:**  
   - List common treatment approaches (OTC medicines, rest, hydration, antibiotics, etc.)  
   - Mention whether doctor consultation is advised  
   - DO NOT suggest prescription-only medicines unless truly essential

4. 🧠 **Medical Reasoning:**  
   - Briefly explain the logic behind the diagnosis (1–2 lines)  
   - Use medically grounded reasoning and show link between symptoms and condition(s)

---

📝 **Constraints**:  
- Keep all responses **brief, readable, and professional**  
- No hallucinations — base your output only on the symptoms provided  
- Prefer common, evidence-based medical knowledge  
- Always recommend consultation if symptoms are severe, persistent, or uncertain

IMPORTANT: You MUST respond in this EXACT format with all sections present.`;
  }
  
  /**
   * Improved Test Recommender prompt
   */
  private static constructTestRecommenderPrompt(symptoms: string): string {
    return `Analyze symptoms and suggest diagnostic tests:

Symptoms: ${symptoms}

Respond in this EXACT format:

🧪 Recommended Tests:
• [Test Name] - Purpose: [Brief purpose] - Urgency: [High/Medium/Low]
• [Test Name] - Purpose: [Brief purpose] - Urgency: [High/Medium/Low]

Provide 2-3 most relevant tests only.`;
  }
  
  /**
   * Improved Treatment Suggester prompt
   */
  private static constructTreatmentSuggesterPrompt(symptoms: string): string {
    return `Provide treatment recommendations for these symptoms:

Symptoms: ${symptoms}

Respond in this EXACT format:

💊 Treatment Recommendations:
• [Treatment] - [Brief explanation]
• [Treatment] - [Brief explanation]

🚨 When to See a Doctor:
• [Warning sign]
• [Warning sign]

Focus on OTC medications and general care. Be medically responsible.`;
  }
  
  /**
   * Improved Reasoning Tree prompt
   */
  private static constructReasoningTreePrompt(symptoms: string): string {
    return `Explain the medical reasoning for these symptoms:

Symptoms: ${symptoms}

Respond in this EXACT format:

🧠 Medical Reasoning:
• [Symptom] → [What it suggests] → [Clinical significance]
• [Pattern] → [Likely mechanism] → [Why it matters]

Provide 2-3 key reasoning points maximum.`;
  }
  
  /**
   * Enhanced Radiology prompt for better analysis
   */
  private static constructRadiologyPrompt(description: string): string {
    return `You are a medical AI assistant trained to analyze chest X-rays and return precise, radiology-style findings in a compact, clinical format. 

A user has uploaded a chest X-ray image. Analyze the image and return output in the following structure:

---

1. ✅ **Findings:**  
   - Summarize key radiological observations (e.g., infiltrates, consolidation, cardiomegaly, pleural effusion)  
   - Be objective, do not speculate beyond visible evidence

2. 🩺 **Possible Conditions/Interpretation:**  
   - Based on findings, list most probable condition(s) (e.g., pneumonia, tuberculosis, COPD)  
   - Be cautious with severe diagnoses unless clearly visible

3. 🧪 **Recommended Follow-up Tests:**  
   - Suggest any further imaging (e.g., CT), blood tests, or consultations needed

4. 📋 **Radiologist-Style Impression (Compact Summary):**  
   - 1–2 line summary in radiology tone  
   - e.g., "Bilateral patchy opacities suggestive of atypical pneumonia. Recommend clinical correlation."

---

📝 **Constraints**:  
- Output must be concise, clinical, and medically accurate  
- Use clear radiology terminology  
- Avoid hallucinating findings not present in the image  
- Don't guess patient history unless mentioned

${description ? `Patient context: ${description}` : ""}

Now analyze the image accordingly.`;
  }
}

export default GeminiService;
