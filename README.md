# GuardAI — AI-Based API Breaking Change Detection System

GuardAI is an **AI-assisted backend observability tool** that automatically learns real API request/response schemas from live traffic, detects **breaking or risky API changes**, and alerts developers **before clients fail in production**.

It acts as a **safety guard for backend APIs**, preventing silent production breakages caused by unintended schema changes.

---

## The Problem

In real production systems:

* APIs change frequently
* Developers may accidentally:

  * remove fields
  * rename fields
  * change data types
  * modify nested structures
* Frontend, mobile apps, or other services **break silently**
* Bugs are discovered **only after user complaints**

Traditional solutions fail because:

* Documentation becomes outdated
* Schema validation is skipped
* Breaking changes are detected **too late**

---

## The GuardAI Solution

GuardAI provides **automatic API contract intelligence**:

* Learns API schemas directly from **live traffic**
* Maintains **versioned contracts per endpoint**
* Detects **breaking, risky, and safe changes**
* Stores **alerts with severity classification**
* Estimates the **traffic impact percentage**
* Displays insights in a **developer dashboard**

All of this works **without manual schema definitions**.

---

## Architecture Overview

### Core System Components

#### 1. Traffic Capture Middleware

* Intercepts request/response structures
* Stores **only schema**, never sensitive values
* Sends data to background processing logic

#### 2. Contract Inference Engine

* Detects:

  * required vs optional fields
  * data types
  * nested structures
* Builds a **baseline contract per endpoint**

#### 3. Contract Versioning System

* Maintains a **history of schema versions**
* Enables **old vs new contract comparison**

#### 4. Change Detection Engine

Classifies schema changes into:

* **BREAKING** → required field removed / type mismatch
* **RISKY** → structure or loosened type change
* **SAFE** → optional field added

#### 5. Alerting System

* Stores alerts in PostgreSQL
* Shows:

  * change type
  * affected field
  * severity
  * timestamp

#### 6. Impact Analysis

* Estimates the **percentage of recent traffic affected**
* Helps teams **prevent bad deployments**

#### 7. Developer Dashboard (React)

Provides:

* Endpoint explorer
* Contract history viewer
* Alerts timeline with severity badges
* Impact warning banner

---

## Tech Stack

### Backend

* Node.js
* Express
* PostgreSQL

### Frontend

* React

### Planned Enhancements

* Redis for caching
* BullMQ for background processing
* npm package distribution
* Cloud-hosted SaaS dashboard

---

## Project Structure

```
ai-api-breaking-change-detector/
│
├── backend/        # GuardAI monitoring engine
├── dashboard/      # React developer dashboard
└── guardai-monitor/ # (Planned) npm package version
```

---

## Local Setup Guide

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ai-api-breaking-change-detector
```

---

### 2. Create PostgreSQL Database

```sql
CREATE DATABASE guard_ai;
```

Create the required tables (contracts, alerts, request_logs) using the provided schema in the project.

---

### 3. Configure Backend Environment

Create a `.env` file inside **backend/**:

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=guard_ai
```

---

### 4. Start Backend Server

```bash
cd backend
npm install
npm run dev
```

Expected output:

```
Server running on port 5000
PostgreSQL connected
```

---

### 5. Start React Dashboard

```bash
cd dashboard
npm install
npm start
```

Open in browser:

```
http://localhost:3000
```

---

## Example: Breaking Change Detection

### Original API Response

```json
{ "id": 1, "name": "Ram", "email": "a@mail.com" }
```

### After Accidental Change

```json
{ "id": 1, "name": "Ram" }
```

### GuardAI Automatically Detects

* **REMOVED_FIELD → BREAKING**
* Stores alert in the database
* Displays a warning in the dashboard
* Estimates **traffic impact %**

➡ Developers can fix the issue **before users are affected**.

---

## Real-World Integration

GuardAI can be integrated into any **Express backend** as middleware:

```js
app.use(trafficCapture);
```

Once enabled, it provides:

* automatic API contract monitoring
* early breaking-change detection
* safer production deployments

---

## Learning Outcomes

This project demonstrates:

* real backend system design
* observability engineering principles
* API lifecycle management
* intelligent automation without heavy ML
* full-stack integration with a monitoring dashboard

---

## Future Roadmap

* Publish GuardAI as an **npm package**
* Add **Redis caching** and **BullMQ workers**
* Support **multi-service monitoring**
* Build a **cloud-hosted SaaS observability platform**

---

## Author

**Rachit**
Computer Science Student
Interested in **backend engineering, observability, and developer infrastructure tools**.

---

## Support the Project

If you find GuardAI useful:

* Give the repository a **star ⭐**
* Share feedback or improvements

It really helps!
