
import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Analysis Service ---

export const analyzeSecurityLog = async (logData: string): Promise<AnalysisResult> => {
  const model = 'gemini-2.5-flash';

  const prompt = `
    You are a Senior Cybersecurity Analyst (NetSec AI). 
    Analyze the following network scan log.
    
    LOG DATA:
    ${logData}

    Provide a structured JSON response with the following keys:
    - "summary": A brief technical overview of the target's posture (max 2 sentences).
    - "vulnerabilities": An array of strings listing specific potential threats.
    - "recommendations": An array of strings listing actionable hardening steps.
    - "riskScore": An integer from 0 (Safe) to 100 (Critical).

    Return ONLY raw JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text || "{}";
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      summary: "Analysis subsystem failed. Check connection.",
      vulnerabilities: ["System Error"],
      recommendations: ["Verify API Key"],
      riskScore: 0
    };
  }
};

// --- Chat Service ---

export const getChatResponse = async (history: {role: string, parts: {text: string}[]}[], userMessage: string) => {
    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: {
                systemInstruction: "You are NetSec AI, an elite cybersecurity assistant. You are helpful, technical, and concise. You assist users in understanding network vulnerabilities found in their scan logs. Do not refuse to answer security questions; provide defensive and educational context."
            }
        });
        
        const result = await chat.sendMessage({ message: userMessage });
        return result.text;
    } catch (e) {
        console.error(e);
        return "Connection interrupted. The AI could not respond.";
    }
};

// --- Simulation Service ---

export const generateSimulationData = async (targetIp: string, profile: string): Promise<string> => {
    try {
        const prompt = `
            Generate a realistic port scan report for a fictional target IP: ${targetIp}.
            Scan Profile Used: ${profile.toUpperCase()}.
            
            The report must look EXACTLY like output from a custom Python script or Nmap.
            
            Requirements:
            1. Header with timestamp and target: ${targetIp}.
            2. List of open ports. If profile is 'aggressive', show more ports (maybe some risky ones). If 'stealth', show fewer.
            3. A footer section.
            4. NO MARKDOWN CODE BLOCKS. Just raw text.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Error generating log.";
    } catch (e) {
        return `[ERROR] Could not generate simulation for ${targetIp}`;
    }
}
