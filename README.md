# 💼 MalipoHaki – AI-Powered Fair Wage Analysis Web App  
![Status](https://img.shields.io/badge/Status-Live-brightgreen)
![SDG](https://img.shields.io/badge/SDG-8%20%7C%20Decent%20Work%20and%20Economic%20Growth-blue)
![License](https://img.shields.io/badge/License-MIT-green)

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
| **Machine Learning** | Custom ML algorithms in Edge Functions |
| **Database** | PostgreSQL (via Lovable Cloud) |
| **AI Integration** | Lovable AI (Gemini 2.5) |
| **Authentication** | Supabase Auth |
| **Hosting/Deployment** | Lovable Platform |

---

## 📊 Machine Learning
MalipoHaki uses a custom ML prediction algorithm that:
- Normalizes job titles, education levels, experience, and location data
- Applies weighted factors based on industry standards
- Predicts fair wage ranges using statistical normalization
- Provides confidence scores for each prediction
- Leverages Lovable AI (Gemini 2.5) for contextual explanations and fairness assessments

---

## 🧩 System Architecture
1. **Frontend (React):** Clean, responsive UI built with React, TypeScript, and Tailwind CSS
2. **Backend (Lovable Cloud):** Serverless edge functions handle business logic and ML predictions
3. **ML Algorithm:** Custom prediction engine in edge functions with normalization and weighted factors
4. **Database (PostgreSQL):** Stores wage assessments, benchmarks, and user data with RLS security
5. **AI Integration:** Lovable AI (Gemini 2.5) generates detailed fairness explanations and insights
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
- Geolocation-based cost-of-living adjustments
- Integration with national labor databases
- Improved multilingual support (Swahili + English)
- AI-driven policy recommendations
- Enhanced ML model with larger datasets

## 🤝 Contributing
Contributions are welcome! Fork the repo, create a new branch, and open a pull request describing your improvement.

## 📜 License
This project is licensed under the MIT License – you are free to use, modify, and share with attribution.

## 🌍 Author
**Abraham Sitori**  
Upcoming Economist & Statistician | Software Developer  
Project developed under the AI for Software Engineering specialization.

## ✨ Project Status: Live
Fully functional application with ML-powered wage predictions, AI-generated insights, and company dashboard features.
