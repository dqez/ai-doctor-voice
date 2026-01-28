# AI Doctor Voice - Intelligent Medical Assistant

Welcome to **AI Doctor Voice**, a technology solution designed to optimize the workflow for healthcare professionals. More than just a recording tool, the system acts as a powerful virtual assistant, automating the creation of medical records so that doctors can dedicate their full time and attention to their patients.

## Overview

In high-pressure medical environments, time is precious. AI Doctor Voice solves the "paperwork overload" challenge by listening to medical consultations, automatically converting speech to text, performing medical analysis, and proposing SOAP-standard records along with ICD-10 codes.

We believe that technology should serve people in the most natural and unobtrusive way possible.

## Key Features

### 1. Patient Intake & Session Management

An intuitive interface allows doctors to easily search for existing patient records or create new profiles in just a few clicks, ensuring readiness for immediate consultation.

### 2. Speech-to-Text Recording

The system captures the dialogue between doctor and patient with high accuracy. Speaker diarization features clearly distinguish between the doctor's and patient's voices, ensuring clean data for the analysis phase.

### 3. Medical AI Analysis

This is the "brain" of the system. From the conversation context, the AI will:

- Extract critical medical information.
- Organize data into the **S.O.A.P** structure (Subjective, Objective, Assessment, Plan).
- Suggest the most appropriate **ICD-10** codes based on the clinical context.

### 4. Review & Approval

The final decision always rests with the doctor. A smart Comparison Interface (Diff View) allows doctors to easily review AI suggestions, make quick edits, and finalize accurate medical records before saving them to the EMR system.

## Technology Stack

The project is built on a modern web platform, ensuring high performance and a smooth user experience:

- **Core**: Next.js (App Router)
- **Styling**: Tailwind CSS, Shadcn/ui
- **State Management**: React Hooks & Server Actions
- **AI Integration**: (In progress: LLM & STT model integration)

## Installation & Setup

To start the project locally:

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

3. **Access the application:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

_Developed with the goal of enhancing healthcare quality through technology._
