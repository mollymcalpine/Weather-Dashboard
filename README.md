# North Vancouver Weather Dashboard

A personal weather analytics dashboard that collects, stores, and visualizes hourly weather data for North Vancouver, BC.

**Live Demo:** https://weather-dashboard-two-orcin.vercel.app

## Overview:

This project is a full data pipeline - from API ingestion to cloud storage to frontend visualization.
Every hour, a serverless function fetches current weather conditions from the Open-Meteo API and stores a snapshot in a cloud Postgres database.
The dashboard reads this data and renders interactive charts with a 24-hour and 7-day view toggle.

## Architecture:

Open-Meteo API -> Vercel Serverless Function -> Supabase (PostgreSQL) -> Vanilla JS

Dashboard

↑

cron-job.org (hourly trigger)

## Tech Stack:

- **Frontend:** Vanilla JavaScript, Chart.js, HTML/CSS
- **Backend:** Node.js, serverless function (Vercel)
- **Scheduler:** cron-job.org (hourly HTTP trigger)
- **Data source:** Open-Meteo API (free, no API key required)

## Features:

- Hourly automated data ingestion via serverless function.
- Time-series storage with duplicate prevention using PostgreSQL unique constraints and indexing.
- Interactive dashboard with 24h / 7d toggle.
- Metrics: temperature, feels-like, humidity, wind speed, gusts, pressure, precipitation, weather conditions.
- Fully responsive layout.
- Auto-deploys on push to main.

## Local Development:

Clone the repo, then:

```bash
npm install
```

Create a `.env` file:

```
SUPABASE_URL=https://xvbylpdbnbqpmnwdwhxr.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YnlscGRibmJxcG1ud2R3aHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDAxMDQsImV4cCI6MjA5MTY3NjEwNH0.MbTGQmjhtNoUXoNALugj8Mp9Q16EBBfD-2XB773o3r4
```

Run the ingestion script manually:

```bash
node ingest.js
```

Serve the frontend locally:

```bash
npx serve .
```

## Database Schema:

```sql
CREATE TABLE weather_snapshots (
  id                 BIGSERIAL PRIMARY KEY,
  recorded_at        TIMESTAMPTZ NOT NULL,
  location           TEXT NOT NULL DEFAULT 'North Vancouver, BC',
  temperature_c      NUMERIC(5, 2),
  apparent_temp_c    NUMERIC(5, 2),
  humidity_pct       INTEGER,
  pressure_hpa       NUMERIC(7, 2),
  cloud_cover_pct    INTEGER,
  wind_speed_kmh     NUMERIC(6, 2),
  wind_direction_deg INTEGER,
  wind_gusts_kmh     NUMERIC(6, 2),
  precipitation_mm   NUMERIC(6, 2),
  rain_mm            NUMERIC(6, 2),
  snowfall_cm        NUMERIC(6, 2),
  weather_code       INTEGER,
  is_day             BOOLEAN,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);
```
