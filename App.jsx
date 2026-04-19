import { useState } from "react";
import "./App.css";

function getWeatherIcon(code) {
  if ([0].includes(code)) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if ([3].includes(code)) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌍";
}

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [screen, setScreen] = useState("home");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      setScreen("error");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found.");
      }

      const place = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=5&timezone=auto`
      );
      const data = await weatherRes.json();

      setWeather({
        city: `${place.name}, ${place.country}`,
        temperature: data.current.temperature_2m,
        feelsLike: data.current.apparent_temperature,
        humidity: data.current.relative_humidity_2m,
        wind: data.current.wind_speed_10m,
        code: data.current.weather_code,
      });

      const days = data.daily.time.map((date, i) => ({
        date,
        max: data.daily.temperature_2m_max[i],
        min: data.daily.temperature_2m_min[i],
        code: data.daily.weather_code[i],
      }));

      setForecast(days);
      setScreen("result");
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setScreen("error");
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    setScreen("home");
    setCity("");
    setWeather(null);
    setForecast([]);
    setError("");
  };

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const date = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <div className="bg-orb orb1"></div>
      <div className="bg-orb orb2"></div>
      <div className="bg-orb orb3"></div>

      <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀ Light" : "🌙 Dark"}
      </button>

      {screen === "home" && (
        <section className="dashboard-shell">
          <aside className="sidebar">
            <div className="side-dot active"></div>
            <div className="side-dot"></div>
            <div className="side-dot"></div>
            <div className="side-dot"></div>
          </aside>

          <main className="dashboard-main">
            <div className="top-row">
              <div>
                <h1 className="time-title">{time}</h1>
                <p className="date-text">{date}</p>
                <h2 className="welcome-text">Welcome to Weather Dashboard</h2>
              </div>
            </div>

            <div className="home-search-box">
              <input
                type="text"
                placeholder="Search city..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
              />
              <button onClick={fetchWeather}>Search</button>
            </div>

            {loading && (
              <div className="loading-box">
                <div className="spinner"></div>
                <p className="loading-text">Loading weather data...</p>
              </div>
            )}

            <div className="forecast-strip">
              {["Sun", "Mon", "Tue", "Wed", "Thu"].map((day, index) => (
                <div
                  className={`day-card ${index === 2 ? "selected-day" : ""}`}
                  key={day}
                >
                  <div className="day-icon">
                    {["⚡", "💧", "🌦️", "⛈️", "🌬️"][index]}
                  </div>
                  <p>{day}</p>
                </div>
              ))}
            </div>

            <div className="content-grid">
              <div className="info-card large-card hover-float">
                <h3>Weather Overview</h3>
                <p className="soft-text">
                  Search for any city to view temperature, humidity, wind speed
                  and a 5-day forecast in a clean and colorful dashboard.
                </p>
              </div>

              <div className="info-card hover-float">
                <h3>Weather Details</h3>
                <div className="mini-feature-list">
                  <span>🌡 Temperature</span>
                  <span>💧 Humidity</span>
                  <span>🌬 Wind</span>
                  <span>📅 Forecast</span>
                </div>
              </div>

              <div className="info-card hover-float">
                <h3>Forecast Overview</h3>
                <p className="soft-text">
                  View daily weather patterns and key conditions in a simple,
                  user-friendly layout.
                </p>
              </div>
            </div>
          </main>

          <section className="weather-preview-panel">
            <div className="hero-weather-card pulse-card">
              <div className="hero-top">
                <span className="location-label">{city || "Search a city"}</span>
                <div className="sun-circle"></div>
              </div>

              <div className="hero-main-center">
                <div className="hero-weather-icon">⛅</div>
                <h2 className="hero-temp">29°</h2>
                <p className="hero-condition">Live Weather</p>
              </div>

              <div className="hero-stats">
                <span>🌬 Wind</span>
                <span>💧 Humidity</span>
              </div>
            </div>

            <div className="bottom-mini-card pink hover-float">
              <span>Theme</span>
              <strong>Light / Dark</strong>
            </div>

            <div className="bottom-mini-card orange hover-float">
              <span>Forecast</span>
              <strong>5 Days</strong>
            </div>
          </section>
        </section>
      )}

      {screen === "result" && weather && (
        <section className="dashboard-shell">
          <aside className="sidebar">
            <div className="side-dot active"></div>
            <div className="side-dot"></div>
            <div className="side-dot"></div>
            <div className="side-dot"></div>
          </aside>

          <main className="dashboard-main">
            <div className="top-row">
              <div>
                <h1 className="time-title">{time}</h1>
                <p className="date-text">{date}</p>
                <h2 className="welcome-text">{weather.city}</h2>
              </div>

              <div className="top-actions">
                <button className="new-search-btn" onClick={goHome}>
                  New Search
                </button>
              </div>
            </div>

            <div className="forecast-strip">
              {forecast.map((day, index) => (
                <div
                  className={`day-card ${index === 0 ? "selected-day" : ""}`}
                  key={day.date}
                >
                  <div className="day-icon">{getWeatherIcon(day.code)}</div>
                  <p>{day.date.slice(5)}</p>
                  <small>
                    {Math.round(day.max)}° / {Math.round(day.min)}°
                  </small>
                </div>
              ))}
            </div>

            <div className="content-grid">
              <div className="info-card large-card hover-float">
                <h3>Current Weather</h3>
                <div className="stats-row">
                  <div className="metric-box">
                    <span>Temperature</span>
                    <strong>{Math.round(weather.temperature)}°C</strong>
                  </div>
                  <div className="metric-box">
                    <span>Feels Like</span>
                    <strong>{Math.round(weather.feelsLike)}°C</strong>
                  </div>
                </div>
              </div>

              <div className="info-card hover-float">
                <h3>Humidity</h3>
                <strong className="big-value">{Math.round(weather.humidity)}%</strong>
              </div>

              <div className="info-card hover-float">
                <h3>Wind Speed</h3>
                <strong className="big-value">{Math.round(weather.wind)} km/h</strong>
              </div>
            </div>
          </main>

          <section className="weather-preview-panel">
            <div className="hero-weather-card pulse-card">
              <div className="hero-top">
                <span className="location-label">{weather.city}</span>
                <div className="sun-circle"></div>
              </div>

              <div className="hero-main-center">
                <div className="hero-weather-icon">
                  {getWeatherIcon(weather.code)}
                </div>
                <h2 className="hero-temp">{Math.round(weather.temperature)}°</h2>
                <p className="hero-condition">Live Weather</p>
              </div>

              <div className="hero-stats">
                <span>🌬 {Math.round(weather.wind)} km/h</span>
                <span>💧 {Math.round(weather.humidity)}%</span>
              </div>
            </div>

            <div className="bottom-mini-card pink hover-float">
              <span>Feels Like</span>
              <strong>{Math.round(weather.feelsLike)}°C</strong>
            </div>

            <div className="bottom-mini-card orange hover-float">
              <span>Status</span>
              <strong>{getWeatherIcon(weather.code)}</strong>
            </div>
          </section>
        </section>
      )}

      {screen === "error" && (
        <section className="error-layout">
          <div className="error-card pulse-card">
            <div className="error-icon-large">⚠️</div>
            <h2>City not found</h2>
            <p className="error-text">
              {error || "Please enter a valid city name."}
            </p>
            <div className="error-hint-box">
              Try searching: London, Paris, Tokyo
            </div>
            <button onClick={goHome}>Try Again</button>
          </div>
        </section>
      )}
    </div>
  );
}