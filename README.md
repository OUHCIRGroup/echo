# ECHO: An Open Research Platform for Evaluation of Chat, Human Behavior, and Outcomes

ECHO provides an extensible ecosystem for designing, deploying, and analyzing mixed-method human–AI studies.

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Setup Guide](#setup-guide)
4. [Running the Application](#running-the-application)
5. [Admin Dashboard](#admin-dashboard)
6. [Exporting Data](#exporting-data)

---

## Introduction

ECHO is an open research platform designed to support mixed-method studies of human interaction with AI and digital information systems. It enables researchers across social sciences, humanities, and computing to easily design studies that integrate surveys, writing tasks, conversational interfaces, and reflective evaluations within a single workflow. Participants can complete consent and background questionnaires, engage in multiple information-seeking or AI-assisted tasks, and provide pre- and post-task feedback, while all interactions and responses are securely captured for analysis. By streamlining end-to-end study design and data collection, ECHO lowers technical barriers, fosters reproducible research, and empowers diverse communities to investigate learning, decision-making, creativity, and trust in emerging AI technologies.

---

## Prerequisites

Before starting, make sure you have:

| Requirement               | How to Get It                                                       | Video Tutorials                             |
| ------------------------- | ------------------------------------------------------------------- | ------------------------------------------- |
| **Node.js** (version 14+) | Download from [nodejs.org](https://nodejs.org/)                     | https://www.youtube.com/watch?v=m4D7G3k_TKA |
| **npm**                   | Included with Node.js                                               |                                             |
| **Firebase account**      | Sign up free at [firebase.google.com](https://firebase.google.com/) | https://www.youtube.com/watch?v=B4sRuK3XVTc |
| **OpenAI API key**        | Get from [platform.openai.com](https://platform.openai.com/)        | https://www.youtube.com/watch?v=SzPE_AE0eEo |
| **Brave Search API key**  | Get from [brave.com/search/api](https://brave.com/search/api/)      | https://www.youtube.com/shorts/GJpP6_9wmBE  |

Verify Node.js is installed:

```bash
node --version
npm --version
```

---

## Setup Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/OUHCIRGroup/echo
```

```bash
cd echo
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

**Note:** While this guide uses OpenAI and Brave Search, ECHO supports any compatible chat and search APIs. You can modify the API endpoints in your codebase to connect alternative providers (e.g., Google Gemini,Anthropic Claude, Grok, Google Search, Bing Search).

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
| **Manage Typology**            | Configure intention categories                |
| **API Settings**               | Enter OpenAI and Brave Search API keys        |
| **View Participant Responses** | Export data as CSV                            |

---

## Exporting Data

ECHO provides comprehensive data export functionality:

Exported Data File contains:

1. participants.csv: User registration and completion data
2. background_responses.csv: Demographic survey answers
3. experience_surveys.csv: Post task experience responses
4. questionnaire_responses.csv: Pre/post task intention ratings
5. chat_interactions.csv: Full chat history with timestamps
6. search_interactions.csv: Search queries, results, clicks
7. insitu_survey_responses.csv: In situ popup survey answers
8. notes.csv: Participant notes with timestamps

Steps to Export Data:

1. Log in to admin panel
2. Go to **View Participant Responses**
3. Click **Export as CSV**

---

## Sample Demo Data

Demography Surevy Questions Data:

```bash
[
  {
    "category": "What is your age group?",
    "options": [
      "Under 18",
      "18-24",
      "25-34",
      "35-44",
      "45-54",
      "55-64",
      "65 or older"
    ],
    "required": true
  },
  {
    "category": "What is your gender?",
    "options": [
      "Male",
      "Female",
      "Non-binary/Third gender",
      "Prefer not to say",
      "Prefer to self-describe"
    ],
    "required": true
  },
  {
    "category": "What is the highest level of education you have completed or currently pursuing?",
    "options": [
      "Less than high school",
      "High school graduate or equivalent",
      "Some college, no degree",
      "Trade/technical/vocational training",
      "Associate degree",
      "Bachelor’s degree",
      "Master’s degree",
      "Doctorate"
    ],
    "required": true
  },
  {
    "category": "What is your current employment status?",
    "options": [
      "Employed full-time",
      "Employed part-time",
      "Self-employed",
      "Unemployed",
      "Student",
      "Retired",
      "Prefer not to say"
    ],
    "required": true
  },
  {
    "category": "How frequently do you use ChatGPT?",
    "options": [
      "Never/This is going to be my first time",
      "Occasionally (less than once a week)",
      "Regularly (once a week or more)",
      "Frequently (daily or almost daily)"
    ],
    "required": true
  },
  {
    "category": "How frequently do you use Search Engines (e.g. Google, Bing)?",
    "options": [
      "Never/This is going to be my first time",
      "Occasionally (less than once a week)",
      "Regularly (once a week or more)",
      "Frequently (daily or almost daily)"
    ],
    "required": true
  },
  {
    "category": "How frequently do you use virtual assistants (e.g. Siri, Microsoft Crotana, Google Assistant, Alexa)?",
    "options": [
      "Never/This is going to be my first time",
      "Occasionally (less than once a week)",
      "Regularly (once a week or more)",
      "Frequently (daily or almost daily)"
    ],
    "required": true
  },
  {
    "category": "What is your primary purpose for using ChatGPT?",
    "options": [
      "Education",
      "Work-related tasks",
      "Personal interest/hobby",
      "Entertainment",
      "Other"
    ],
    "allowMultipleSelections": true,
    "selectUpto": 2,
    "required": true
  },
  {
    "category": "What is your primary purpose for using Search Engines (e.g. Google, Bing)?",
    "options": [
      "Education",
      "Work-related tasks",
      "Personal interest/hobby",
      "Entertainment",
      "Other"
    ],
    "allowMultipleSelections": true,
    "selectUpto": 2,
    "required": true
  },
  {
    "category": "What is your primary purpose for using virtual assistant?",
    "options": [
      "Education",
      "Work-related tasks",
      "Personal interest/hobby",
      "Entertainment",
      "Other"
    ],
    "allowMultipleSelections": true,
    "selectUpto": 2,
    "required": true
  },
  {
    "category": "How did you first hear about ChatGPT?",
    "options": [
      "Social media",
      "News article/blog",
      "Friend/Colleague",
      "Academic course/workshop",
      "Other"
    ],
    "allowMultipleSelections": true,
    "required": true
  }
]

```

Typology Survey Question Data:

```bash
[
  {
    "intention_type": "Identify new information",
    "intention_list": [
      {
        "short_text": "Identify an appropriate starting point to search or chat",
        "long_text": "for instance, find good query keywords, appropriate chat prompts, questions or problem descriptions"
      },
      {
        "short_text": "Identify something more to search or learn",
        "long_text": "explore a target topic or domain more broadly or deeper, and obtain more relevant information"
      },
      {
        "short_text": "Identify something new or unexpected",
        "long_text": "explore pieces of information, interest, or advice that are completely new or unexpected; obtain inspiration or ideas for creative projects"
      },
      {
        "short_text": "Obtain explanations",
        "long_text": "search or ask for explanations or clarifications about phenomena, concepts, problems, or potential solutions"
      }
    ]
  },
  {
    "intention_type": "Find information",
    "intention_list": [
      {
        "short_text": "Find a known item or site",
        "long_text": "searching or asking for an item (e.g., a bag, book, name of a restaurant or celebrity), website or information source that you were familiar with in advance."
      },
      {
        "short_text": "Find items sharing a named characteristic",
        "long_text": "finding items or information with something in common."
      },
      {
        "short_text": "Find items without predefined criteria",
        "long_text": "finding items that are potentially useful for a task or problem, but which have not been specified in advance."
      }
    ]
  },
]
```

Task Questions Data:

```bash
[
  {
    "id": 1,
    "title": "Assess the impacts of using AI in hiring processes",
    "description": "Assess the impacts of using AI in hiring processes, considering various societal, cultural and ethical aspects. Should we use AI in hiring processes and why?"
  },
  {
    "id": 2,
    "title": "Investigate the balance between privacy and public safety in the use of surveillance cameras in urban areas",
    "description": "Investigate the balance between privacy and public safety in the use of surveillance cameras in urban areas, considering legal, ethical, and technological perspectives. Should we use surveillance cameras in urban areas and why?"
  },
  {
    "id": 3,
    "title": "Compare the Keto, Vegan, and Mediterranean diets",
    "description": "Compare the Keto, Vegan, and Mediterranean diets focusing on their nutritional profiles, suitability for various age groups, and effects on diabetes and heart health. Please rank the three diets and explain your decision."
  },
]
```

Session Experience Data:

```bash
[
  {
    "key": "overallExperience",
    "question": "How would you rate your overall experience with the current task interaction?",
    "options": [
      "Very Unsatisfactory",
      "Unsatisfactory",
      "Neutral",
      "Satisfactory",
      "Very Satisfactory"
    ]
  },
    {
    "key": "additionalComments",
    "question": "Please provide any additional comments or feedback you have about your experience. If possible, please comment on both unexpected positive experiences and encountered obstacles.",
    "responseType": "open-ended"
  }
]
```

## Support

If you encounter any difficulties or issues, feel free to contact us at jiqunliu@ou.edu.

---
