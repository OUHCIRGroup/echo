# Fixedness Evaluation Research Study

A web application for conducting research studies on functional fixedness using AI tools (ChatGPT) and search engines.

## Table of Contents

1. [What This App Does](#what-this-app-does)
2. [Prerequisites](#prerequisites)
3. [Setup Guide](#setup-guide)
4. [Running the Application](#running-the-application)
5. [Admin Dashboard](#admin-dashboard)
6. [Exporting Data](#exporting-data)

---

## What This App Does

This application helps researchers study how people interact differently with ChatGPT vs. search engines. Participants complete:

- A consent form and background survey
- Two main tasks (one using ChatGPT, one using a search engine)
- Pre and post questionnaires for each task
- Experience surveys after each task

All participant responses and interactions are automatically saved to Firebase for later analysis.

---

## Prerequisites

Before starting, make sure you have:

| Requirement               | How to Get It                                                       |
| ------------------------- | ------------------------------------------------------------------- |
| **Node.js** (version 14+) | Download from [nodejs.org](https://nodejs.org/)                     |
| **npm**                   | Included with Node.js                                               |
| **Firebase account**      | Sign up free at [firebase.google.com](https://firebase.google.com/) |
| **OpenAI API key**        | Get from [platform.openai.com](https://platform.openai.com/)        |
| **Brave Search API key**  | Get from [brave.com/search/api](https://brave.com/search/api/)      |

Verify Node.js is installed:

```bash
node --version
npm --version
```

---

## Setup Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/OUHCIRGroup/fixedness-evaluation
cd fixedness-evaluation
```

### Step 2: Install Dependencies

```bash
npm install
```

This downloads all required packages (may take a few minutes).

---

### Step 3: Set Up Firebase

Firebase stores all your research data.

#### 3.1 Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter a project name (e.g., "fixedness-study")
4. Disable Google Analytics (optional) and click **Create project**

#### 3.2 Enable Authentication

1. Click **Authentication** in the left sidebar
2. Click **Get started**
3. Click **Email/Password**
4. Toggle **Enable** to ON
5. Click **Save**

#### 3.3 Create Firestore Database

1. Click **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode**
4. Select a location closest to your participants
5. Click **Enable**

#### 3.4 Enable Storage

1. Click **Storage** in the left sidebar
2. Click **Get started**
3. Click **Next**, then select location and click **Done**

#### 3.5 Register Your Web App

1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Click **Project settings**
3. Scroll to "Your apps" and click the **Web icon** (`</>`)
4. Enter a nickname and click **Register app**
5. **Keep this page open** — you need the configuration values next

---

### Step 4: Configure Environment Variables

#### 4.1 Create Environment File

```bash
cp .env.example .env
```

#### 4.2 Fill In Your Values

Open `.env` in a text editor:

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_AUTHDOMAIN=your_project_id.firebaseapp.com
REACT_APP_PROJECT_ID=your_project_id
REACT_APP_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_APP_ID=your_app_id
REACT_APP_MEASUREMENT_ID=your_measurement_id

# Admin Setup Code (create your own secure code)
REACT_APP_ADMIN_SETUP_CODE=your_secret_code_here
```

**Mapping from Firebase config:**

| Firebase Config     | Environment Variable            |
| ------------------- | ------------------------------- |
| `apiKey`            | `REACT_APP_FIREBASE_API_KEY`    |
| `authDomain`        | `REACT_APP_AUTHDOMAIN`          |
| `projectId`         | `REACT_APP_PROJECT_ID`          |
| `storageBucket`     | `REACT_APP_STORAGE_BUCKET`      |
| `messagingSenderId` | `REACT_APP_MESSAGING_SENDER_ID` |
| `appId`             | `REACT_APP_APP_ID`              |
| `measurementId`     | `REACT_APP_MEASUREMENT_ID`      |

---

### Step 5: Set Up Admin Account

1. Start the app: `npm start`
2. Go to `http://localhost:3000/admin/setup`
3. Enter your `REACT_APP_ADMIN_SETUP_CODE`
4. Create your admin account (email + password)
5. Log in at `/admin/login`

---

### Step 6: Configure API Keys

Both API keys are configured through the Admin Dashboard.

1. Log in to admin panel at `http://localhost:3000/admin/login`
2. Click **API Settings**
3. Enter both API keys:
   - **OpenAI API Key** (for ChatGPT task)
   - **Brave Search API Key** (for search task)
4. Click **Save**

#### How to Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in
3. Go to **API keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)

**Note:** OpenAI requires a payment method and charges based on usage.

#### How to Get Brave Search API Key

1. Go to [brave.com/search/api](https://brave.com/search/api/)
2. Sign up for an account
3. Choose a plan (free tier available)
4. Go to your dashboard and copy your API key (starts with `BSA`)

---

## Running the Application

Start the development server:

```bash
npm start
```

Opens at `http://localhost:3000`

**Key URLs:**

| URL                                 | Purpose                 |
| ----------------------------------- | ----------------------- |
| `http://localhost:3000`             | Participant entry point |
| `http://localhost:3000/admin/login` | Admin login             |
| `http://localhost:3000/admin/setup` | First time admin setup  |

---

## Admin Dashboard

Access at `/admin/login`

| Feature                        | Description                                   |
| ------------------------------ | --------------------------------------------- |
| **Study Settings**             | Task order, note taking, minimum interactions |
| **Manage Study Flow**          | Enable/disable and reorder study steps        |
| **Insert/View Tasks**          | Create and view research tasks                |
| **Manage Experience Survey**   | Edit post-task questions                      |
| **Manage Demography Survey**   | Edit background questions                     |
| **Manage Topology**            | Configure intention categories                |
| **API Settings**               | Enter OpenAI and Brave Search API keys        |
| **View Participant Responses** | Export data as CSV                            |

---

## Exporting Data

1. Log in to admin panel
2. Go to **View Participant Responses**
3. Click **Export as CSV**

---
