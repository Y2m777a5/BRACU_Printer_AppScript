# BRACU_Printer_AppScript

Printer WebApp and Google Sheet Add-on built with Google Apps Script for BRAC University's print station.

## 📌 Project Overview
This project provides a web interface and Google Sheet modal dialog for submitting document print jobs to the BRAC University campus printer system (`campus.printer@g.bracu.ac.bd`). Users can upload files, select print settings (single-sided vs. double-sided), and submit jobs, while the system backs up files to Google Drive and logs transactions into Google Sheets.

---

## 🏗️ Architecture & Features

### 1. Backend (`AppSript/Code.gs`)
- **Google Sheets Menu Integration (`onOpen`)**: Adds a custom toolbar menu under **BRACU Printing ➔ Upload & Print File**.
- **Web App & Modal (`showUploadDialog` & `doGet`)**: Renders `UploadDialog.html` either inside Google Sheets or as a standalone Web App.
- **File Processing & Dispatch (`processUpload`)**:
  - Decodes Base64 file payloads into binary blobs.
  - Enforces a total combined upload limit of **25 MB**.
  - Backs up uploaded files directly to Google Drive via `DriveApp`.
  - Dispatches an email to `campus.printer@g.bracu.ac.bd` via `GmailApp` with attached files. Sets subject to `#duplex` when double-sided printing is selected.
  - Logs transaction details (File Names, Print Options, Drive Links, Timestamp) in the active Google Sheet.

### 2. Frontend (`AppSript/UploadDialog.html`)
- **User Interface**: Clean, responsive card UI with a drag-and-drop file upload zone.
- **Supported Formats**: `.pdf`, `.docx`, `.pptx`, `.xlsx`.
- **Print Settings**: Option to toggle between Single-sided and Double-sided (`#duplex`) printing.
- **File Management**: Live file listing with cumulative size checking and option to remove selected files before sending.
- **Client-Side Processing**: Converts files to Base64 asynchronously and communicates with the backend via `google.script.run`.
