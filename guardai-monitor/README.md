# GuardAI Monitor

**GuardAI Monitor** is a plug-and-play Node.js middleware that automatically tracks API traffic, detects schema changes, and alerts you about breaking changes in real-time.

⚠️ This package is currently under development and not yet published to npm.
---

## Features

* Automatic API request/response logging
* Schema extraction & versioning
* Breaking change detection (removed fields, type changes)
* Field usage tracking & impact analysis
* Background processing with Redis + BullMQ
* Safe fallback (works even without Redis)

---

## Installation

```bash
npm install guardai-monitor
```

---

## Requirements

* Node.js (v16+ recommended)
* Supabase project (for storing logs, contracts, alerts)
* Redis (optional but recommended for background processing)

---

## Quick Start

### 1. Setup middleware

```js
const express = require("express");
const guardaiMonitor = require("guardai-monitor");

const app = express();
app.use(express.json());

app.use(
  guardaiMonitor({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    projectId: "your-project-id", // must be UUID
  })
);

app.post("/test-user", (req, res) => {
  res.json({
    id: 1,
    ...req.body,
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
```

---

## Run Worker (for background processing)

Create a file:

```js
// scripts/runWorker.js
const { startWorker } = require("guardai-monitor/src/worker/Worker");

startWorker({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
});
```

Run it:

```bash
# Windows (PowerShell)
$env:SUPABASE_URL="your_url"
$env:SUPABASE_KEY="your_key"
$env:REDIS_URL="redis://127.0.0.1:6379"

node scripts/runWorker.js
```

---

## Database Setup (Supabase)

You need the following tables:

* `request_logs`
* `contracts`
* `alerts`
* `field_usage`

---

### Required Constraint (IMPORTANT)

```sql
alter table alerts
add constraint unique_alert
unique (endpoint, method, field, change_type, project_id, user_id);
```

---

### Required Function (for safe alert deduplication)

```sql
create or replace function upsert_alert(
  p_endpoint text,
  p_method text,
  p_field text,
  p_change_type text,
  p_severity text,
  p_user_id uuid,
  p_project_id uuid
)
returns void as $$
begin
  insert into alerts (
    endpoint, method, field, change_type, severity,
    occurrence_count, user_id, project_id
  )
  values (
    p_endpoint, p_method, p_field, p_change_type, p_severity,
    1, p_user_id, p_project_id
  )
  on conflict (endpoint, method, field, change_type, project_id, user_id)
  do update
  set occurrence_count = alerts.occurrence_count + 1,
      severity = excluded.severity;
end;
$$ language plpgsql;
```

---

## How It Works

1. Middleware captures request & response
2. Logs stored in Supabase (`request_logs`)
3. Job pushed to queue (or processed inline)
4. Worker:

   * Extracts schema
   * Compares with previous version
   * Stores new contract
   * Generates alerts

---

## Breaking Change Detection

GuardAI detects:

* Removed fields → **BREAKING**
* Type changes → **BREAKING**
* New fields → **SAFE**

---

## Example

### Request 1

```json
{
  "name": "user",
  "email": "user@example.com"
}
```

### Request 2

```json
{
  "name": "user"
}
```

Result:

* Detects `email` field removed
* Creates **BREAKING alert**

---

## Environment Variables

| Variable     | Required | Description             |
| ------------ | -------- | ----------------------- |
| SUPABASE_URL | ✅        | Supabase project URL    |
| SUPABASE_KEY | ✅        | Supabase API key        |
| REDIS_URL    | ❌        | Redis connection string |

---

## Fallback Behavior

* No Redis → processes inline (no crash)
* Invalid payload → skipped safely
* Duplicate alerts → prevented at DB level

---

## Project Structure (internal)

```
src/
  config/
  models/
  queue/
  services/
  worker/
  index.js
  trafficCapture.js
```

---

## Use Cases

* API version monitoring
* Prevent breaking frontend changes
* Track schema evolution
* Debug production API issues

---

## Notes

* `projectId` must be a valid UUID
* Use separate Supabase project for testing
* Redis is recommended for production

---

## License

MIT

---

## Author

Built by Rachit Chauhan
