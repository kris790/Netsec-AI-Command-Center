import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from '../types';

// Initialize the Gemini Client
// NOTE: In a real production app, you'd likely proxy this through a backend.
// For this standalone demo, we use the environment variable directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSecurityLog = async (logData: string): Promise<AnalysisResult> => {
  const model = 'gemini-2.5-flash';

  const prompt = `
    You are a Senior Cybersecurity Analyst. 
    Analyze the following network scan log (from Nmap or a Python scanner).
    
    LOG DATA:
    ${logData}

    Provide a structured JSON response with the following keys:
    - "summary": A brief overview of the target's posture.
    - "vulnerabilities": An array of strings listing specific potential threats (e.g., "Port 23 Telnet is unencrypted").
    - "recommendations": An array of strings listing actionable hardening steps.
    - "riskScore": An integer from 0 (Safe) to 100 (Critical).

    Return ONLY raw JSON. Do not use markdown code blocks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      summary: "Failed to analyze log data. Please ensure the API key is valid and the log is readable.",
      vulnerabilities: ["Analysis Error"],
      recommendations: ["Check API Key", "Try a different log format"],
      riskScore: 0
    };
  }
};

export const generateSimulationData = async (): Promise<string> => {
    // Use Gemini to generate a realistic looking "random" scan log for the demo
    // Mimic the provided Python script output format
    try {
        const prompt = `
            Generate a realistic port scan report that looks EXACTLY like it was output by a custom Python script. 
            
            Use this specific format structure (do not include markdown code blocks, just raw text):
            
            ============================================================
            Scan Report
            ============================================================
            Target: 192.168.1.45 (192.168.1.45)
            Scan completed: [Current Timestamp]
            Open ports found: 4
            ============================================================

            PORT		STATE		SERVICE
            ------------------------------------------------------------
            21		    open		FTP
            22		    open		SSH
            80		    open		HTTP/Web Server
            3389		open		RDP

            Security Recommendations:
            ------------------------------------------------------------
            ⚠️  Port 21 (FTP) uses unencrypted communication
            ⚠️  Port 3389 (RDP) exposed - ensure strong authentication
            
            IMPORTANT:
            1. The target is 192.168.1.45.
            2. It MUST have ports 21, 22, 80, and 3389 open.
            3. Include the security recommendations section at the bottom with the warning emojis.
            4. Do not add extra conversational text. Just the log output.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "";
    } catch (e) {
        return "Simulation data generation failed.";
    }
}