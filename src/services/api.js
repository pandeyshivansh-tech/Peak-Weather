export const getWeather = async (lat, lon) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility&hourly=temperature_2m,weather_code,precipitation_probability,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset&timezone=auto`
  );
  return res.json();
};

export const getCoordinates = async (city) => {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`
  );
  return res.json();
};

export const getCityFromCoords = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (!res.ok) throw new Error("Reverse geocode failed");
    const data = await res.json();
    return {
      name: data.city || data.locality || data.principalSubdivision || "Your Location",
      countryCode: data.countryCode || null,
    };
  } catch (err) {
    console.error("Reverse geocode error:", err);
    return { name: "Your Location", countryCode: null };
  }
};