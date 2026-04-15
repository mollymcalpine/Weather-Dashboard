import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// North Vancouver Coordinates:
const LAT = 49.320556;
const LON = -123.073889;

async function fetchAndStore() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,` +
    `precipitation,rain,snowfall,weather_code,cloud_cover,` +
    `pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day` +
    `&timezone=America%2FVancouver`;

    const res = await fetch(url);
    const data = await res.json();
    const c = data.current;

    const snapshot = {
        recorded_at:        c.time,
        temperature_c:      c.temperature_2m,
        apparent_temp_c:    c.apparent_temperature,
        humidity_pct:       c.relative_humidity_2m,
        pressure_hpa:       c.pressure_msl,
        cloud_cover_pct:    c.cloud_cover,
        wind_speed_kmh:     c.wind_speed_10m,
        wind_direction_deg: c.wind_direction_10m,
        wind_gusts_kmh:     c.wind_gusts_10m,
        precipitation_mm:   c.precipitation,
        rain_mm:            c.rain,
        snowfall_cm:        c.snowfall,
        weather_code:       c.weather_code,
        is_day:             c.is_day === 1,
        precip_forecast_mm: data.hourly?.precipitation?.[1] ?? null, // Precipitation forecast for the next hour.
    };

    const { error } = await supabase
        .from('weather_snapshots')
        .upsert(snapshot, { ignoreDuplicates: true });
    
    if (error) {
        console.error('Insert failed:', error.message);
    } else {
        console.log(`Stored snapshot for ${c.time} - ${c.temperature_2m}°C`);
    }
}

fetchAndStore();

