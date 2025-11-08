# 💼 MalipoHaki – AI-Powered Fair Wage Analysis Web App  
![Status](https://img.shields.io/badge/Status-Live-brightgreen)
![SDG](https://img.shields.io/badge/SDG-8%20%7C%20Decent%20Work%20and%20Economic%20Growth-blue)
![License](https://img.shields.io/badge/License-MIT-green)

**🌐 Live Demo**: [https://malipohaki.lovable.app](https://malipohaki.lovable.app)

## 🧭 Overview
**MalipoHaki** is an AI-powered web application that helps **employees** and **companies** evaluate the fairness of wages in relation to industry standards, education level, work experience, and location.  
The project contributes to **UN Sustainable Development Goal 8 – Decent Work and Economic Growth**, promoting transparency and equity in compensation practices.

---

## 🎯 Objectives
- Empower workers to understand if their wages are fair.  
- Help employers ensure equitable pay structures.  
- Use data-driven machine learning models to predict fair wage ranges.  
- Encourage accountability and fairness across industries.

---

## 🧠 Core Features
### 🧍 For Employees
- Enter job title, education, experience, and location to assess wage fairness.  
- Receive an AI-generated report:
  - Wage fairness category ("Below Market Average," "Fair Wage," "Above Market Average")  
  - Confidence score  
  - Short explanation of reasoning  

### 🏢 For Companies (HR Portal)
- Company dashboard for HR departments.  
- Evaluate multiple employee wages at once.  
- Get **3 free assessments**, after which subscription/payment is required.  
- Premium access includes detailed analytics and exportable insights.

### 💳 Payment Integration
- Simple checkout flow for HR departments to subscribe to premium reports.  
- (Planned) Integration with secure payment APIs such as Stripe or Paystack.

---

## 🧰 Tech Stack
| Layer | Technology |
|-------|-------------|
| **Frontend** | React • TypeScript • Tailwind CSS • Vite |
| **Backend** | Lovable Cloud (Supabase) |
| **AI Engine** | Google Gemini 2.5 Flash (via Lovable AI Gateway) |
| **Database** | PostgreSQL (via Lovable Cloud) |
| **Authentication** | Supabase Auth |
| **Hosting/Deployment** | Lovable Platform |

---

## 🤖 AI-Powered Wage Analysis
MalipoHaki uses **Google Gemini 2.5 Flash** (via Lovable AI Gateway) for intelligent wage predictions:
- **No traditional ML training required** – leverages Gemini's pre-trained knowledge of:
  - Kenya's job market and industry standards
  - Cost of living variations across counties
  - Education and experience impact on compensation
  - Current market rates for similar roles
- **Prompt-engineered analysis** – sends job details to the AI with carefully crafted prompts
- **Real-time predictions** – generates fair wage estimates, confidence scores, and reasoning instantly
- **Contextual explanations** – provides detailed, actionable insights about wage fairness

---

## ⚠️ Known Limitations & Potential Biases

### Model Limitations
As MalipoHaki relies on **Google Gemini 2.5 Flash**, an AI model trained on global data, users should be aware of the following potential biases and limitations:

#### 1. **Training Data Bias**
- Gemini's training data may not adequately represent Kenya's job market, particularly:
  - Informal sector wages (which comprise a significant portion of Kenya's economy)
  - Rural and remote area compensation standards
  - Emerging industries and non-traditional roles

#### 2. **Geographic & Regional Bias**
- The model may overweight data from urban centers (Nairobi, Mombasa) due to data availability
- Wage predictions for smaller towns and rural areas may be less accurate
- Cost-of-living adjustments may not fully capture local economic realities

#### 3. **Temporal Bias**
- AI model knowledge may be outdated compared to rapidly changing market conditions
- Recent economic shifts (inflation, policy changes) may not be reflected
- Currency fluctuations and economic volatility may not be adequately modeled

#### 4. **Industry Representation**
- Well-documented industries (tech, finance, healthcare) likely have more accurate predictions
- Underrepresented sectors may receive less reliable wage estimates
- Emerging roles and gig economy positions may lack sufficient reference data

#### 5. **Socioeconomic Factors**
- The model may not fully account for:
  - Gender wage gaps in specific industries
  - Discrimination based on ethnicity, age, or disability
  - Company size variations (SMEs vs. multinationals)
  - Public vs. private sector differences

#### 6. **Lack of Local Nuance**
- Kenya-specific factors may be underweighted:
  - Union representation and collective bargaining
  - Government wage policies and guidelines
  - Industry-specific certifications and local qualifications
  - Cultural and social factors affecting compensation

### Our Commitment
We acknowledge these limitations and are committed to:
- **Transparency**: Clearly communicating confidence scores and limitations
- **Continuous Improvement**: Monitoring prediction accuracy and adjusting prompts
- **User Feedback**: Collecting real-world data to identify systematic biases
- **Responsible AI**: Encouraging users to use predictions as guidance, not absolute truth

**Important**: MalipoHaki predictions should be used as **reference points** for wage discussions, not as definitive assessments. We encourage users to combine AI insights with local market research, industry reports, and professional advice.

---

## 🧩 System Architecture
1. **Frontend (React):** Clean, responsive UI built with React, TypeScript, and Tailwind CSS
2. **Backend (Lovable Cloud):** Serverless edge functions handle business logic and API orchestration
3. **AI Engine:** Google Gemini 2.5 Flash analyzes job profiles and predicts fair wages in real-time
4. **Database (PostgreSQL):** Stores wage assessments, benchmarks, and user data with RLS security
5. **AI Gateway:** Lovable AI Gateway provides seamless access to Gemini models without API key management
6. **Authentication:** Secure user authentication with email/password via Supabase Auth

---

## 🚀 Deployment
The application is deployed on the **Lovable Platform** with automatic deployment on code changes.  
Backend edge functions are automatically deployed and scaled.

---

## 🧩 Installation (Local Development)
```bash
# Clone the repository
git clone https://github.com/yourusername/MalipoHaki.git
cd MalipoHaki

# Install dependencies
npm install

# Run development server
npm run dev
```

The application uses Lovable Cloud for backend services, which is automatically configured.

## 🧠 Future Enhancements
- Wage visualization charts for HR dashboards
- CSV bulk upload for large-scale employee assessments
- Geolocation-based cost-of-living adjustments
- Integration with national labor databases
- Improved multilingual support (Swahili + English)
- AI-driven policy recommendations
- Advanced AI model experimentation (GPT-5, Gemini Pro)

## 🤝 Contributing
Contributions are welcome! Fork the repo, create a new branch, and open a pull request describing your improvement.

## 📜 License
This project is licensed under the MIT License – you are free to use, modify, and share with attribution.

## 🌍 Author
**Abraham Sitori**  
Upcoming Economist & Statistician | Software Developer  
Project developed under the AI for Software Engineering specialization.

## ✨ Project Status: Live
Fully functional application with AI-powered wage predictions using Google Gemini 2.5 Flash, intelligent insights, and company dashboard features.
