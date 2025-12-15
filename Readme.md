# Automated Data Extraction & Invoice Management

A full-stack web application built as part of the **Swipe assignment**, designed to automatically extract, structure, and manage invoice data from **PDFs, images, and Excel files** using **Google Gemini AI**.

The application organizes extracted information into **Invoices, Products, and Customers**, with real-time synchronization across views.

---

## 🚀 Live Demo

- **Frontend (Vercel):** https://getswipe-assignment.vercel.app  
- **Backend (Render):** https://getswipe-assignment.onrender.com  

---
## 📷 Sample Images

## **Home**
<img width="1916" height="859" alt="image" src="https://github.com/user-attachments/assets/53739eb0-ba61-49a9-a490-0f316c306bf3" />

## **Workspace**
<img width="1713" height="850" alt="image" src="https://github.com/user-attachments/assets/e5bcba7e-9f05-436c-bc85-1d87657bde29" />



---

## ✨ Features

### AI-Powered Data Extraction
- Uses **Google Gemini AI** to extract structured data from:
  - PDFs
  - Images
  - Excel / CSV files
- Works with mixed file types using a generic AI extraction pipeline.

### Multi-File Upload Support
- Supports uploading **multiple files in a single run**.
- ⚠️ **Important:** Uploading many files at once may quickly consume the **free Gemini API quota**.
- The quota is automatically restored after a few hours.
- ✅ **Recommended:** Upload **one file at a time** for best accuracy and stability.
- For heavy multi-file usage, upgrading to **Gemini Pro** is advised.

### Structured Data Views
- **Invoices Tab**
  - Serial Number
  - Customer Name
  - Product Name
  - Quantity
  - Tax %
  - Total Amount
  - Invoice Date
  - Additional calculated fields (tax, subtotal, payment status)

- **Products Tab**
  - Product Name
  - Quantity
  - Unit Price
  - Tax %
  - Price with Tax
  - Optional Discount and Taxable Value

- **Customers Tab**
  - Customer Name
  - Phone Number (if available)
  - Total Purchase Amount
  - Aggregated insights from invoices

### Real-Time Sync with Redux
- Changes in **Products** or **Customers** instantly reflect in **Invoices**.
- Centralized Redux store ensures consistency across all views.

### UX & Validation
- Missing values are clearly highlighted with a `! missing` indicator.
- Editable table cells with visual validation.
- Clean **dark theme UI** with high-contrast tables and inputs.
- User-friendly feedback for upload, processing, and errors.

---

## 🧠 AI Test Coverage

The system was tested with:
- Invoice PDFs
- Invoice PDFs + Images
- Excel files
- Multiple Excel files
- Mixed file uploads (PDF + Image + Excel)

Handles missing or partial data gracefully as required by the assignment.

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
- **Frontend:** Vercel
- **Backend:** Render
- Environment variables managed securely (no `.env` committed)

---

## ⚠️ Gemini API Usage Note

- Multi-file extraction is supported.
- Free Gemini API keys have **limited quota**.
- Uploading many files in one run may temporarily block further requests.
- Quota resets automatically after a few hours.
- Best practice: **Upload one file → analyze → continue**, unless using **Gemini Pro**.

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
Create .env files locally and configure environment variables in Render and Vercel dashboards for production.



---
Built as part of the Swipe Frontend + AI Engineering Assignment.


