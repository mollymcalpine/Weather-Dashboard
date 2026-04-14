import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// North Vancouver Coordinates:
const LAT = 49.320556;
const LON = -123.073889;

const WMO_CODES = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: "Icy fog", 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
    61: 'Slight rain', 63: 'Rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Snow', 75: 'Heavy snow',
    80: 'Rain showers', 81: 'Ran showers', 82: 'Violent showers', 95: 'Thunderstorm',
};

export default async function handler(req, res) {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,` +
        `precipitation,rain,snowfall,weather_code,cloud_cover,` +
        `pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day` +
        `&timezone=America%2FVancouver`;

    const weatherRes = await fetch(url);
    const data = await weatherRes.json();
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
        weather_code:       WMO_CODES[c.weather_code] || 'Unknown',
        is_day:             c.is_day === 1,
    };

    const { error } = await supabase
        .from('weather_snapshots')
        .upsert(snapshot, { ignoreDuplicates: true });
    
    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, recorded_at: c.time, temp: c.temperature_2m });
}