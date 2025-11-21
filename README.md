# NetSec AI Command Center 🛡️

A cyberpunk-styled security dashboard that combines a port scan simulator with real-world log analysis powered by **Google Gemini 2.5 Flash**.

![Status](https://img.shields.io/badge/Status-Online-success)
![AI](https://img.shields.io/badge/AI-Gemini%202.5-blue)
![Theme](https://img.shields.io/badge/Theme-Cyberpunk-purple)

## 🚀 Features

### 1. Port Scan Simulator
- **Visualizer**: Real-time visualization of network port traversing using a grid system.
- **Simulation**: mimics a stealth SYN scan on a target IP (192.168.1.x).
- **Log Generation**: Automatically generates a realistic "Python script" output log using Gemini AI for testing the analyzer.

### 2. AI Log Analyzer
- **Vulnerability Assessment**: Pasting raw logs (Nmap, Python scripts, etc.) triggers a Gemini AI analysis.
- **Risk Scoring**: Calculates a risk score (0-100) based on open ports and banners.
- **Actionable Insights**: Provides specific hardening recommendations (e.g., "Disable Telnet," "Update RDP creds").

### 3. Integrated Python Tooling
- Includes a fully functional, professional-grade **Python Port Scanner (`port_scanner.py`)**.
- Users can view, copy, and download the script directly from the UI to run on local networks.

### 4. Accessibility
- **High-Contrast Mode**: A dedicated toggle to switch from the aesthetic Cyberpunk theme to a high-visibility, pure black-and-white mode for better readability in bright environments.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS (Custom Config)
- **AI Integration**: Google GenAI SDK (`@google/genai`)
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
   - Set it in your environment variables as `API_KEY`.

4. Run the development server:
   ```bash
   npm start
   ```

## 🖥️ Usage

### The Simulator
1. Navigate to the **SCAN SIMULATOR** tab.
2. Click **START SIMULATION**.
3. Watch the visualizer traverse ports.
4. Once complete, a log is generated. Click **COPY TO ANALYZER**.

### The Analyzer
1. Navigate to the **LOG ANALYZER** tab.
2. Paste network logs into the input area.
   - *Tip: You can use the output from the built-in Python script or standard Nmap output.*
3. Click **INITIATE AI ANALYSIS**.
4. Review the Risk Score, Vulnerabilities, and Recommendations.

### Running the Python Script
1. Click **GET PYTHON SCANNER SCRIPT** on the Simulator tab.
2. Copy the code.
3. Save it as `port_scanner.py` on your local machine.
4. Run it:
   ```bash
   python3 port_scanner.py -t localhost
   ```

## ⚠️ Legal Disclaimer

This tool is designed for **educational purposes** and authorized security testing only. 
- **Do not** scan networks you do not own or have explicit permission to test.
- The developers assume no liability for misuse of the provided Python scripts or analysis tools.

---

*System Status: ONLINE // End of Line*