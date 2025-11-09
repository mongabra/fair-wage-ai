# 💼 MalipoHaki – AI-Powered Fair Wage Analysis Web App  
![Status](https://img.shields.io/badge/Status-Live-brightgreen)
![SDG](https://img.shields.io/badge/SDG-8%20%7C%20Decent%20Work%20and%20Economic%20Growth-blue)
![License](https://img.shields.io/badge/License-MIT-green)

**🌐 Live Demo** → [https://fair-wage-ai.lovable.app/](https://fair-wage-ai.lovable.app/)  
**📊 Pitch Deck** → [https://malipohaki-8hoiueu.gamma.site/](https://malipohaki-8hoiueu.gamma.site/) 

---

## 🧭 Overview
**MalipoHaki** is an **AI-powered web application** that helps **employees** and **companies** evaluate the fairness of wages relative to education, experience, industry standards, and location.  
Built in support of **UN Sustainable Development Goal 8 – Decent Work and Economic Growth**, it promotes **transparency, fairness, and accountability** in Kenya’s job market.

---

## 🎯 Objectives
- Empower workers to understand whether their wages are fair.  
- Enable employers to benchmark and structure equitable pay systems.  
- Use data-driven AI to predict fair wage ranges.  
- Promote fair labor practices through accessible wage intelligence.

---

## 🧠 Core Features

### 🧍 For Employees
- Enter job details to assess **wage fairness** instantly.  
- Receive AI-generated feedback:
  - Wage fairness category (Below Average • Fair • Above Average)  
  - Confidence score  
  - Short explanation of reasoning  

### 🏢 For Companies (HR Portal)
- Company dashboard for bulk wage evaluations.  
- **3 free assessments**, then unlock **premium analytics** via payment.  
- Premium users access detailed visualizations and downloadable insights.

### 💳 Payment Integration
- Secure, simplified checkout for HR departments.  
- Currently integrating **InstaSend (sandbox)**, with future support for **Stripe** or **Paystack**.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React • TypeScript • Tailwind CSS • Vite |
| **Backend** | Lovable Cloud (Supabase Functions) |
| **AI Engine** | Google Gemini 2.5 Flash (via Lovable AI Gateway) |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Supabase Auth |
| **Deployment** | Lovable Platform |

---

## 🤖 AI-Powered Wage Analysis

MalipoHaki leverages **Google Gemini 2.5 Flash** through **Lovable’s AI Gateway**, offering real-time, prompt-engineered wage insights.

**How it works:**
1. User inputs job data → AI prompt crafted dynamically  
2. Gemini model predicts wage range, confidence, and reasoning  
3. Results are presented clearly for either an individual or HR team  

Key advantages:
- Instant, data-informed analysis  
- No traditional ML training required  
- Contextual explanations with confidence indicators  

---

## ⚖️ Responsible AI & Limitations (Summary)

MalipoHaki’s predictions rely on **Gemini’s global training data**, which may not fully capture Kenya’s local job market, informal sectors, or rapidly changing economic conditions.  
To ensure responsible usage:
- Confidence scores are always shown to indicate prediction reliability  
- Regional and sectoral nuances are acknowledged transparently  
- AI output is intended as **guidance**, not a final judgment  

**Our Commitment:**  
We are developing a **localized dataset and fine-tuned Kenyan wage model** to make future predictions more accurate, inclusive, and contextually relevant.

---

## 🧩 System Architecture
1. **Frontend:** React + Tailwind (responsive UI)  
2. **Backend:** Lovable Cloud (serverless functions)  
3. **AI Layer:** Gemini 2.5 Flash via Lovable AI Gateway  
4. **Database:** PostgreSQL with row-level security  
5. **Auth:** Supabase Authentication  
6. **Payments:** In progress (InstaSend sandbox setup)

---

## 🚀 Deployment
The app is hosted on **Lovable Cloud**, with automatic build and deploy workflows.  
Backend edge functions scale seamlessly as user traffic grows.

---

## 🧩 Local Development Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/MalipoHaki.git
cd MalipoHaki

# Install dependencies
npm install

# Run locally
npm run dev
```

## 🧠 Future Enhancements
-📊 Visual wage dashboards & analytics
-📍 Geolocation-based cost-of-living adjustments
-📁 CSV upload for HR bulk assessments
-🗣️ Multilingual support (Swahili & English)
-🔍 Fine-tuned Kenyan Wage AI Model trained on real local data
-🧾 Integration with National Labor & Policy Databases

## 🤝 Contributing
Contributions are welcome! Fork the repo, create a new branch, and open a pull request describing your improvement.

## 📜 License
This project is licensed under the MIT License – you are free to use, modify, and share with attribution.

## 🌍 Author
**Abraham Sitori**  
Upcoming Economist & Statistician | Software Developer  
Project developed under the AI for Software Engineering specialization; PLP Academy

## ✨ Project Status: Live
Fully functional application with AI-powered wage predictions using Google Gemini 2.5 Flash, intelligent insights, and company dashboard features.
