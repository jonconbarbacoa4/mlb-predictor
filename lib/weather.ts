// lib/weather.ts
import { teamCities } from './teamCities';

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function getWeatherByCity(city: string) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    return {
      temp: data.main.temp,
      condition: data.weather[0].description,
      wind: data.wind.speed,
    };
  } catch (error) {
    console.error(`🌧️ Error al obtener clima de ${city}:`, error);
    return null;
  }
}

export async function getWeatherForTeam(teamId: number) {
  const city = teamCities[teamId];
  if (!city) {
    console.warn(`⚠️ No se encontró ciudad para el equipo con ID ${teamId}`);
    return null;
  }

  return await getWeatherByCity(city);
}