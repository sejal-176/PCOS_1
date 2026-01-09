
export enum RiskLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface PCOSAssessmentData {
  age: number;
  weight: number;
  height: number;
  bmi: number;
  bloodGroup: string;
  pulseRate: number;
  cycleLength: number;
  cycleStatus: string; 
  pregnant: boolean;
  weightGain: boolean;
  hairGrowth: boolean;
  skinDarkening: boolean;
  hairLoss: boolean;
  pimples: boolean;
  fastFood: boolean;
  exercise: boolean;
  waistHipRatio: number;
  // New Hormone & Clinical Inputs
  fsh: number;
  lh: number;
  tsh: number;
  amh: number;
  prolactin: number;
  vitaminD3: number;
}

export interface AssessmentResult {
  id: string;
  userId: string;
  timestamp: number;
  inputs: PCOSAssessmentData;
  riskLevel: RiskLevel;
  confidence: number;
  summary: string;
  recommendations: string[];
}
