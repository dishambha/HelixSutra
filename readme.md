
# 🧬 HelixSutra — AI-Powered Pharmacogenomic Risk Analyzer

**helixsutra** is an AI-driven precision medicine platform that analyzes patient genetic variants from **VCF files** to generate personalized drug response risk predictions, clinical recommendations, and biological explanations.

The system combines:

* Pharmacogenomics rule-based intelligence (CPIC guidelines)
* Explainable AI reasoning using LLMs
* Scalable cloud deployment
* Multi-platform access (Web + Telegram Bot)

Built for the **RIFT 2026 HealthTech Hackathon — Pharmacogenomics / Explainable AI Track**. 

---

# 🌐 Live Demo

**Web Application:**
👉 [https://helixsutra.netlify.app](https://helixsutra.netlify.app/)

**Backend API:**
👉 [https://helixsutra.onrender.com](https://helixsutra.onrender.com)

**Telegram Bot username:**
👉 @helixsutrabot

Bot Flow:

```
/start → Upload VCF → Enter medicine name → Receive report
```

---

# 🎥 Demo Video

LinkedIn Demo:
👉 https://www.linkedin.com/posts/dishambha-awasthi_helixsutra-ai-powered-pharmacogenomic-ugcPost-7430428882354356224-7Az1?utm_source=share&utm_medium=member_android&rcm=ACoAAD5lY90BqqRt2h6xFPH8KzH2KsEr89_EQ4Q

Hashtags:
#RIFT2026 #helixsutra #Pharmacogenomics #AIinHealthcare

---

# 🚀 Key Features

✅ Upload genetic `.vcf` files
✅ Drug-gene pharmacogenomic risk prediction
✅ CPIC guideline-based recommendations
✅ AI-generated biological explanations
✅ Structured JSON output (schema compliant)
✅ Clinical PDF report generation
✅ Telegram bot interaction
✅ Production deployment (Render + Netlify)
✅ Secure environment configuration

---

# 🏗️ System Architecture

```
User (Web / Telegram)
        ↓
React Frontend (Netlify)
        ↓
FastAPI Backend (Render)
        ↓
Pharmacogenomic Rule Engine
        ↓
LLM Explanation Engine (Groq)
        ↓
Response Builder
        ↓
JSON + PDF Reports
```

---

# 🧠 How It Works

1. User uploads a **VCF genetic file**
2. System parses pharmacogenomic variants
3. Rule engine maps variants to drug response risk
4. AI generates biological and clinical explanations
5. System returns:

   * Risk classification
   * Genetic profile
   * Clinical recommendation
   * Explainable AI narrative
6. User downloads JSON & PDF report

---

# 🧪 Supported Genes

* CYP2D6
* CYP2C19
* CYP2C9
* SLCO1B1
* TPMT
* DPYD

---

# 💊 Supported Drugs

* Codeine
* Warfarin
* Clopidogrel
* Simvastatin
* Azathioprine
* Fluorouracil

---

# 📡 API Documentation

## POST `/analyze`

### Request

Form Data:

| Field | Type   | Description          |
| ----- | ------ | -------------------- |
| file  | .vcf   | Genetic variant file |
| drug  | string | Drug name            |

---

### Response Schema

```json
{
  "patient_id": "PATIENT_XXX",
  "drug": "DRUG_NAME",
  "timestamp": "ISO8601",
  "risk_assessment": {
    "risk_label": "Safe | Adjust Dosage | Toxic | Ineffective | Unknown",
    "confidence_score": 0.95,
    "severity": "low | moderate | high | critical"
  },
  "pharmacogenomic_profile": {
    "primary_gene": "GENE",
    "diplotype": "*X/*Y",
    "phenotype": "PM | IM | NM | RM | URM",
    "detected_variants": []
  },
  "clinical_recommendation": {},
  "llm_generated_explanation": {},
  "quality_metrics": {}
}
```

---

# 📄 Report Generation

helixsutra automatically generates:

* `report.json` — structured machine-readable output
* `report.pdf` — clinician-friendly medical report

PDF includes:

* Risk classification
* Genetic interpretation
* Clinical recommendation
* AI explanation
* Quality metrics

---

# 🤖 Telegram Bot

Bot Username: **@helixsutrabot**

Usage:

```
/start
Upload VCF file
Enter medicine name
Receive:
  • Risk summary
  • JSON data
  • PDF report
```

---

# ⚙️ Installation & Local Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/dishambha/HelixSutra.git
cd helixsutra
```

---

## 2️⃣ Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate
```

---

## 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4️⃣ Environment Variables

Create `.env` file:

```
GROQ_API_KEY=your_key
TELEGRAM_BOT_TOKEN=your_token
BACKEND_DOMAIN=your_domain
```

---

## 5️⃣ Run Backend

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 6️⃣ Run Telegram Bot

```bash
python run_telegram_bot.py
```

---

# ☁️ Deployment

Frontend: Netlify
Backend: Render
Bot: Render Background Worker

Production Features:

* HTTPS enabled
* Auto restart
* Environment-based secrets
* Scalable workers

---

# 🔐 Security Considerations

* API keys stored in environment variables
* Upload size validation
* Secure HTTPS communication
* No persistent genetic data storage

---

# ⚠️ Medical Disclaimer

helixsutra provides **informational pharmacogenomic insights only**.

It is **not a medical diagnostic system** and should not replace professional clinical judgment.

Always consult qualified healthcare professionals.

---

# 📈 Future Improvements

* Doctor dashboard
* Patient history database
* Multi-drug analysis
* Visualization charts
* Multi-language support
* EHR integration
* Webhook Telegram mode

---

# 👨‍💻 Team

**Helix Sutra Team**
AI-Powered Precision Medicine Platform

---

# ⭐ License

MIT License

---

# 🏁 Hackathon Submission Compliance

This project includes:

✅ Live deployed application
✅ Public GitHub repository
✅ LinkedIn demo video
✅ Complete README documentation
✅ JSON schema compliance

All requirements aligned with **RIFT 2026 submission guidelines**. 

---

✅ If you want, I can also:

* Convert this into **proper PDF design (with colors & sections)**
* Or create a **GitHub-optimized README with badges and screenshots**

Just tell me 👍.
