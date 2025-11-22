# NetSec AI Command Center v2.0 🛡️

A cyberpunk-styled security dashboard that combines a configurable port scan simulator with a conversational AI Consultant powered by **Google Gemini 2.5 Flash**.

![Status](https://img.shields.io/badge/Status-Online-success)
![Version](https://img.shields.io/badge/Version-2.0-cyan)
![AI](https://img.shields.io/badge/AI-Gemini%202.5-blue)

## 🚀 What's New in v2.0

- **🗣️ Interactive AI Consultant**: The analyzer is no longer static. Have a full conversation with the AI to ask follow-up questions about specific vulnerabilities (e.g., *"How do I patch CVE-2024-XXXX on Windows?"*).
- **⚙️ Configurable Scans**: Set custom Target IPs and choose between **Stealth**, **Aggressive**, or **Full Range** scan profiles to simulate different network noise levels.
- **🕒 Operation History**: A new sidebar tracks your recent scan sessions and risk scores.

## ✨ Core Features

### 1. Advanced Port Scan Simulator
- **Visualizer**: Real-time "Hollywood-style" grid visualization of network port traversing.
- **Profiles**:
  - **Stealth**: Simulates a slow, quiet scan to avoid IDS detection.
  - **Aggressive**: Fast, noisy scan that detects more services but raises alarms.
  - **Full Range**: Simulates scanning all 65,535 ports.
- **Log Generation**: Automatically generates realistic output logs (nmap/python style) for testing the analyzer.

### 2. Intelligent Log Analysis & Chat
- **Vulnerability Assessment**: Paste raw logs (Nmap, Python scripts, etc.) to get a scored risk assessment (0-100).
- **Conversational Interface**: After the initial report, chat with **NetSec AI** to get specific commands, remediation steps, or educational context about the findings.

### 3. Professional Python Tooling
- Includes a fully functional **Python Port Scanner (`port_scanner.py`)**.
- View source code directly in the app, copy it, or download it to run on local networks for legitimate security testing.

### 4. Accessibility & Theming
- **Cyberpunk Mode**: The default immersive interface with CRT flickers and neon glow.
- **High-Contrast Mode**: A dedicated toggle for high-visibility, pure black-and-white UI for better readability in bright environments.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS (Custom Configuration)
- **AI Engine**: Google GenAI SDK (`@google/genai`)
- **State Management**: React Context & Hooks
- **Icons**: Lucide React

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/netsec-ai-center.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment:
   - You need a valid Google Gemini API Key.
   - Set it in your environment variables as `API_KEY` or strictly follow the recommended secure injection method for your deployment platform.

4. Run the development server:
   ```bash
   npm start
   ```

## 🖥️ Usage Guide

### The Active Scanner
1. Go to the **OPS_CENTER** tab.
2. Enter a **Target IP** and select a **Profile** (e.g., *Aggressive*).
3. Click **INITIATE SCAN**.
4. Watch the visualizer. Once complete, click **SEND TO INTEL ANALYZER**.

### The Intel Analyzer
1. Go to the **INTEL_ANALYSIS** tab.
2. Review the initial **Risk Score** and **Vulnerabilities**.
3. Use the chat window on the right to ask the AI questions like:
   - *"What is the command to close port 23 on Linux?"*
   - *"Explain why having RDP open to the internet is dangerous."*

### Real-World Scanning
1. Click **View Source** next to the scan button.
2. Copy the Python script code.
3. Run it on your terminal:
   ```bash
   python3 port_scanner.py -t localhost
   ```
4. Paste the output back into the Web App's Analyzer for an AI report.

## ⚠️ Legal Disclaimer

This tool is designed for **educational purposes** and authorized security testing only. 
- **Do not** scan networks you do not own or have explicit permission to test.
- The developers assume no liability for misuse of the provided Python scripts or analysis tools.

---

*System Status: ONLINE // End of Line*