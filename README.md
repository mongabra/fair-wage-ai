# 💼 MalipoHaki – AI-Powered Fair Wage Analysis Web App  
![Status](https://img.shields.io/badge/Status-In%20Progress-yellow)
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
  - Wage fairness category (“Below Market Average,” “Fair Wage,” “Above Market Average”)  
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
| **Frontend** | HTML • CSS • JavaScript |
| **Backend** | Django |
| **Machine Learning** | scikit-learn • pandas • NumPy |
| **Database** | MySQL |
| **AI Integration** | Lovable API / Hugging Face Model |
| **Hosting/Deployment** | Vercel |
| **Optional** | Supabase (for authentication + data storage) |

---

## 📊 Machine Learning
MalipoHaki uses a model trained on public datasets from **Kaggle** that include:
- Job title, education, experience, location, and wage data.  
- The model predicts a “fair wage range” based on user input.  
- Uses scikit-learn regression and normalization pipelines.  

*(Dataset examples: “Kenyan Salary Data,” “Global Job Salary Predictions,” etc.)*

---

## 🧩 System Architecture
1. **Frontend:** User interacts with clean, responsive web UI.  
2. **Backend (Django):** Handles form submissions, business logic, and connects to ML model.  
3. **ML Model:** Predicts wage fairness based on trained regression model.  
4. **Database (MySQL):** Stores user and company assessments.  
5. **Edge Function / AI API:** Lovable API or Hugging Face model provides contextual fairness explanations.  

---

## 🚀 Deployment
The project will be deployed on **Vercel** for scalability and ease of hosting.  
Future plans include CI/CD pipeline and model retraining integration.

---

## 🧩 Installation (Local Development)
```bash
# Clone the repository
git clone https://github.com/yourusername/MalipoHaki.git
cd MalipoHaki

# Install dependencies
pip install -r requirements.txt

# Set up MySQL database
python manage.py makemigrations
python manage.py migrate

# Run server
python manage.py runserver
```

🧠 Future Enhancements

Wage visualization charts for HR dashboards.

Geolocation-based cost-of-living adjustments.

Integration with national labor databases.

Improved multilingual support (Swahili + English).

AI-driven policy recommendations.

🤝 Contributing

Contributions are welcome!
Fork the repo, create a new branch, and open a pull request describing your improvement.

📜 License

This project is licensed under the MIT License – you are free to use, modify, and share with attribution.

🌍 Author

Abraham Sitori
Upcoming Economist & Statistician | Software Developer
Project developed under the AI for Software Engineering specialization.

✨ Project Status: In Progress

Development ongoing — integrating ML model and API for real-time wage fairness predictions.

