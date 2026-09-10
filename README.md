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
  - Supports generating **1 to 40 copies** individually per document by duplicating attachments in the email dispatch.
  - Enforces a combined total attachment limit of **25 MB** across all files and copies.
  - Backs up uploaded files directly to Google Drive via `DriveApp`.
  - Dispatches an email to `campus.printer@g.bracu.ac.bd` via `GmailApp` with attached files. Sets subject to `#duplex` when double-sided printing is selected.
  - Logs transaction details (File Names & Copy Counts, Print Options, Drive Links, Timestamp) in the active Google Sheet.

### 2. Frontend (`AppSript/UploadDialog.html`)
- **User Interface**: Clean, responsive card UI with drag-and-drop file upload zone.
- **Per-File Stepper Controls (`[-] N [+]`)**: Features inline minus `−`, count `N` (min 1, max 40), and plus `+` buttons for each selected file.
- **Live Size Calculation**: Recalculates total attachment size dynamically when copies are incremented/decremented and prevents exceeding the 25 MB limit.
- **Info Notice**: Displays campus printing rules (jobs expire after 4 hours; page range selection can also be adjusted directly on physical printer touchscreens).
- **Supported Formats**: `.pdf`, `.docx`, `.pptx`, `.xlsx`.
- **Google Sheets Style Pill Dropdown**: Beautiful custom pill selector for Print Options (*Single-sided* green vs. *Double-sided (#duplex)* yellow-orange) with smooth animations and outside click dismissal.
- **File Management**: Live file listing with cumulative size checking (factoring in copies count).
- **Client-Side Processing**: Converts files to Base64 asynchronously and communicates with the backend via `google.script.run`.
