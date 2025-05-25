# 🩺 MediNova – Smarter Diagnosis. Safer Care.

An **AI-powered healthcare platform** leveraging **multi-agent intelligence** and **Gemini 2.0 (Flash + Vision)** to provide intelligent diagnostics, radiology insights, treatment suggestions, and real-time interaction — built for **patients, doctors**, and healthcare innovators.

📦 [GitHub Repository](https://github.com/Thorfinn05/MediNova-AI)
🔗 [Live Site](https://medinova-ai.vercel.app/)

---

## 🌟 Overview

*MediNova* transforms modern healthcare diagnostics with the power of **advanced AI agents** and **multimodal analysis**. Whether you're a concerned patient or a medical professional, MediNova simplifies symptom decoding, test/treatment guidance, radiology interpretation, and medical communication — securely and intelligently.

---

## 🔍 Core Features

### 💬 Symptom Analyzer

* Smart symptom-to-disease mapping using **Gemini 2.0 Flash**
* Text or **voice input** support for ease of use
* Generates probable causes with actionable recommendations

### 🧪 Test Recommender

* Suggests relevant diagnostic tests based on symptom profiles
* Helps avoid redundant or unnecessary testing

### 💊 Treatment Suggester

* Uses AI reasoning to provide **evidence-based treatment plans**
* Designed to aid patients and assist physicians in decision-making

### 🖼️ Image Annotator

* Upload medical scans (X-ray, MRI, etc.) for AI-powered annotation
* Gemini Vision identifies visible signs and anomalies

### 📋 Prescription Analyzer

* Upload prescriptions (including handwritten ones)
* Extracts medications, dosages, instructions
* Highlights **affordable alternatives** and pricing insights

### 📄 PDF Medical Summary

* Auto-generated patient summary and analysis in PDF format
* Includes annotated image, extracted insights, and reports

### 🧠 AI Radiology Assistant

* Vision-powered deep scan interpretation
* Ideal for remote diagnostics or second opinions

### 🔊 Voice Interaction System

* Talk to MediNova using your voice — available in assistant + symptom modules
* Built using **Web Speech API** and optimized for accessibility

### 🧑‍⚕️ Doctor’s Portal

* Manage patient analysis history
* Track cases, review prescriptions, and collaborate securely

### 🔐 Data Security & HIPAA-Readiness

* Role-based access for patients and doctors
* Firestore & Firebase Auth used with data encryption practices

### 🤖 Aether Chatbot

* Natural, real-time chat with a friendly medical AI assistant

---

## 🧠 Architecture – How MediNova Works

MediNova runs on **micro-agent AI architecture**, with each module responsible for a specialized healthcare function:

1. **Input Parser** (Text, Image, or Voice)
2. **Symptom Agent**
3. **Test & Treatment Agent**
4. **Radiology Vision Agent**
5. **Prescription OCR + NLP**
6. **PDF Generator**
7. **Chat & Follow-up Agent**

Each agent uses **Gemini 2.0 (Flash or Vision)** in a coordinated pipeline, providing **human-level insights** in real time.

---

## 🛠 Tech Stack

| Layer           | Technology                              |
| --------------- | --------------------------------------- |
| 🧑‍🎨 Frontend  | React.js, Tailwind CSS, Vite            |
| 🧠 AI Backend   | Gemini 2.0 Flash + Vision APIs (Google) |
| 🔐 Auth & DB    | Firebase Authentication, Firestore DB   |
| 🗣️ Voice Input | Web Speech API                          |
| 🧩 UI Libraries | Framer Motion, Shadcn/UI, Lucide Icons  |
| ☁️ Deployment   | Vercel                                  |

---

## 🖼️ UI Preview

> (Add screenshots of each module: Symptom Analyzer, Prescription Decoder, Radiology Scanner, Doctor Dashboard)

---

## 📦 Installation Guide

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Thorfinn05/MediNova-AI.git
cd medinova
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Add your `.env` file

```env
VITE_GEMINI_API_KEY=your_api_key_here
VITE_FIREBASE_API_KEY = your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN = your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = your_project_id
VITE_FIREBASE_STORAGE_BUCKET = your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = your_messaging_sender_id
VITE_FIREBASE_APP_ID = your_app_id
VITE_FIREBASE_MEASUREMENT_ID = your_measurement_id
```

### 4️⃣ Start the development server

```bash
npm run dev
```

App will run at: [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```bash
medinova/
├── public/                 # Static files
├── src/
│   ├── components/         # Reusable UI Components
│   ├── pages/              # Route-based pages
│   ├── assets/             # Images & icons
│   ├── utils/              # AI service handlers
│   └── App.jsx             # Main App entry
├── .env                    # Environment config
├── package.json            # Dependencies
└── vite.config.js          # Build config
```

---

## 🚀 Upcoming Enhancements

| Feature                                                  | Status     |
| -------------------------------------------------------- | ---------- |
| 📍 Location-based pharmacy suggestions from prescription | 🚧 Planned |
| 📱 Fully responsive mobile PWA version                   | 🚧 Planned |
| 🧑‍⚕️ Enhanced Doctor–Pharmacy collaboration portal      | 🚧 Planned |
| 🧬 Wearable health integration                           | 🚧 Planned |
| 🌐 Multilingual Support                                  | 🚧 Planned |
| 🧠 More accurate AI-powered radiology insight pipeline   | 🚧 Planned |

---

## 🐛 Challenges We Overcame

* Integrating **multi-modal AI agents** (text + vision) into one flow
* Ensuring OCR works well on real-world, low-quality prescription images
* Making chatbot answers both **concise and medically relevant**
* Handling simultaneous PDF generation + image processing
* Voice input integration using Web Speech API on multiple browsers
* Designing for both **doctors** and **patients** without complexity

---

## 👨‍💻 Team

* **Rudranil Das** – [@Thorfinn05](https://github.com/Thorfinn05)
* **Aitijhya Roy** – [@AitijhyaCoded](https://github.com/AitijhyaCoded)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 💡 Contribute

We welcome contributions from the open-source community.
Check out the [CONTRIBUTING.md](CONTRIBUTING.md) (add if needed).

```bash
# Fork → Clone → Branch → Code → Pull Request 🚀
```

---

> 🧬 *Empowering diagnostics with AI — one pixel, one symptom at a time.*

---
