# BILL PILOT AI - Automated Data Extraction & Invoice Management System

A full-stack web application I built to automatically extract, structure, and manage invoice data from PDFs, images, and Excel files using Google Gemini AI.

The system converts unstructured documents into structured business data and organizes them into Invoices, Products, and Customers with real-time synchronization across all views.

---

## 🚀 Live Demo

- Frontend (Vercel): https://billpilot-app.vercel.app/  
- Backend (Render): https://billpilot-app.onrender.com  

---

## ✨ Key Features

### 🤖 AI-Powered Data Extraction
- Extracts structured data from:
  - PDFs
  - Images
  - Excel / CSV files
- Uses a generic AI pipeline capable of handling mixed file types.

### 📂 Multi-File Upload Support
- Upload multiple documents in one run.
- Supports mixed formats (PDF + Image + Excel).
- Free Gemini API has limited quota; heavy uploads may temporarily block requests.
- Recommended: Upload files one at a time for best accuracy.
- Gemini Pro is advised for large-scale usage.

### 📊 Structured Data Views

#### Invoices
- Invoice Number
- Customer Name
- Product Name
- Quantity
- Tax %
- Subtotal & Total Amount
- Invoice Date
- Calculated fields (tax, subtotal, payment status)

#### Products
- Product Name
- Quantity
- Unit Price
- Tax %
- Price with Tax
- Optional discount and taxable value

#### Customers
- Customer Name
- Phone Number (if available)
- Total Purchase Amount
- Aggregated insights from invoices

### 🔄 Real-Time Sync
- Centralized state management using Redux Toolkit.
- Updates in Products or Customers instantly reflect in Invoices.

### 🎨 UX & Validation
- Missing values highlighted with `! missing` indicator.
- Editable tables with live validation.
- Dark-themed, high-contrast UI.
- Clear upload, processing, and error feedback.

---

## 🧠 AI Testing Coverage
- Invoice PDFs
- PDFs + Images
- Excel files
- Multiple Excel files
- Mixed file uploads

Handles partial and missing data gracefully.

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Redux Toolkit
- Axios

### Backend
- Node.js
- Express
- Multer
- Google Gemini API

### Deployment
- Frontend: Vercel
- Backend: Render
- Secure environment variables (no .env committed)

---

## ⚠️ Gemini API Notes
- Free API has limited quota.
- Quota resets automatically after a few hours.
- Best practice: Upload → Review → Continue.

---

## 📦 Local Setup

```bash
# Frontend
cd client
npm install
npm run dev

# Backend
cd server
npm install
npm run dev
```

Configure environment variables locally and in deployment dashboards.

---


