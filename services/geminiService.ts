
import { GoogleGenAI, Type } from "@google/genai";
import { PCOSAssessmentData, RiskLevel, AssessmentResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * This service simulates the Random Forest (RF) model logic provided in the training script.
 * It uses the clinical features (Age, BMI, FSH, LH, AMH, etc.) and focuses on the 
 * probability calibration and balanced class weighting logic described.
 */
export async function analyzePCOSRisk(userId: string, data: PCOSAssessmentData): Promise<AssessmentResult> {
  const fshLhRatio = data.fsh > 0 ? (data.lh / data.fsh).toFixed(2) : "N/A";
  
  // System instruction to force the AI to simulate the Random Forest classifier's reasoning
  const systemInstruction = `
    You are a specialized Medical AI Surrogate for a Random Forest Classifier trained on PCOS datasets.
    Your task is to analyze patient features and provide a risk assessment as if you were the model 
    (n_estimators=300, max_depth=6, calibrated with isotonic regression).
    
    Key indicators the model prioritizes:
    1. LH/FSH Ratio: Ratios > 2.0 are high-risk indicators.
    2. AMH: Levels > 4.5 ng/mL are significant for polycystic morphology.
    3. BMI & Weight Gain: Metabolic markers.
    4. Cycle Regularity: Clinical foundation for diagnosis.
    5. Skin & Hair: Androgen excess markers (Hirsutism, Acne).
  `;

  const prompt = `
    Perform a diagnostic prediction for Patient ID: ${userId}.
    
    Input Vector:
    - Age: ${data.age}
    - BMI: ${data.bmi} (derived from ${data.weight}kg, ${data.height}cm)
    - FSH: ${data.fsh} mIU/mL, LH: ${data.lh} mIU/mL (Ratio: ${fshLhRatio})
    - AMH: ${data.amh} ng/mL
    - TSH: ${data.tsh} mIU/L
    - Prolactin: ${data.prolactin} ng/mL
    - Vitamin D3: ${data.vitaminD3} ng/mL
    - Cycle: ${data.cycleStatus} (Length: ${data.cycleLength} days)
    - Weight Gain: ${data.weightGain ? 'Yes' : 'No'}
    - Hirsutism: ${data.hairGrowth ? 'Yes' : 'No'}
    - Hair Loss: ${data.hairLoss ? 'Yes' : 'No'}
    - Acne: ${data.pimples ? 'Yes' : 'No'}
    - Darkening: ${data.skinDarkening ? 'Yes' : 'No'}
    - Diet: ${data.fastFood ? 'Frequent Fast Food' : 'Healthy'}
    - Exercise: ${data.exercise ? 'Regular' : 'No'}
    
    Return the result in JSON format with riskLevel (LOW, MODERATE, HIGH), confidence (0-1), 
    a summary of findings, and a list of 4-5 actionable medical or lifestyle recommendations.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview", // Using Pro for complex medical reasoning logic
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskLevel: { type: Type.STRING, enum: Object.values(RiskLevel) },
          confidence: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["riskLevel", "confidence", "summary", "recommendations"]
      }
    }
  });

  const analysis = JSON.parse(response.text);

  return {
    id: `rpt_${Date.now()}`,
    userId,
    timestamp: Date.now(),
    inputs: data,
    ...analysis
  };
}
