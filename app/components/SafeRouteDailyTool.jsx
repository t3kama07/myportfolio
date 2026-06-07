"use client";

import { useState } from "react";
import { SAFE_ROUTE_LOCATIONS } from "@/utils/safeRouteLocations";
import {
  calculateOutdoorScore,
  generateRecommendation,
  generateWarnings,
  getAvoidTimeWindow,
  getBestTimeWindow,
  getScoreLabel,
} from "@/utils/outdoorScore";

const ACTIVITY_IDS = [
  "walking",
  "cycling",
  "running",
  "outdoor-work",
  "travel",
  "child-elderly-outing",
];

function createDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function createDateOptions(locale) {
  const today = new Date();

  return Array.from({ length: 16 }, (_, index) => {
    const date = addDays(today, index);
    const dateKey = createDateKey(date);
    const formattedDate = formatForecastDate(dateKey, locale);

    if (index === 0) {
      return {
        value: dateKey,
        label: `${textOrFallback(locale, "today", "Today")} (${formattedDate})`,
      };
    }

    if (index === 1) {
      return {
        value: dateKey,
        label: `${textOrFallback(locale, "tomorrow", "Tomorrow")} (${formattedDate})`,
      };
    }

    return {
      value: dateKey,
      label: formattedDate,
    };
  });
}

function textOrFallback(locale, key, fallback) {
  const fallbacks = {
    en: {
      today: "Today",
      tomorrow: "Tomorrow",
    },
    fi: {
      today: "Tanaan",
      tomorrow: "Huomenna",
    },
  };

  return fallbacks[locale]?.[key] || fallback;
}

function getTimeZoneParts(timeZone) {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    const parts = formatter.formatToParts(new Date());
    const mapped = {};

    parts.forEach((part) => {
      if (part.type !== "literal") {
        mapped[part.type] = part.value;
      }
    });

    return {
      dateKey: `${mapped.year}-${mapped.month}-${mapped.day}`,
      hour: Number(mapped.hour),
    };
  } catch {
    const now = new Date();
    return {
      dateKey: now.toISOString().slice(0, 10),
      hour: now.getHours(),
    };
  }
}

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatMetric(value, suffix = "", digits = 0) {
  const numeric = toNumber(value);
  if (numeric === null) return "--";
  return `${numeric.toFixed(digits)}${suffix}`;
}

function formatLocationName(location) {
  if (!location?.name) {
    return "";
  }

  return location.country ? `${location.name}, ${location.country}` : location.name;
}

function formatForecastDate(dateKey, locale) {
  if (!dateKey) {
    return "";
  }

  const parsedDate = new Date(`${dateKey}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateKey;
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(parsedDate);
  } catch {
    return dateKey;
  }
}

function buildWeatherRows(weatherData, airQualityData, timeZone, selectedDateKey) {
  const weatherTimes = weatherData?.hourly?.time || [];
  const airTimes = airQualityData?.hourly?.time || [];
  const airByTime = new Map();

  airTimes.forEach((time, index) => {
    airByTime.set(time, {
      pm2_5: toNumber(airQualityData.hourly?.pm2_5?.[index]),
      pm10: toNumber(airQualityData.hourly?.pm10?.[index]),
      nitrogen_dioxide: toNumber(airQualityData.hourly?.nitrogen_dioxide?.[index]),
      ozone: toNumber(airQualityData.hourly?.ozone?.[index]),
    });
  });

  const nowParts = getTimeZoneParts(timeZone);
  const selectedRows = weatherTimes
    .map((time, index) => {
      const airRow = airByTime.get(time) || {};

      return {
        time,
        temperature_2m: toNumber(weatherData.hourly?.temperature_2m?.[index]),
        relative_humidity_2m: toNumber(weatherData.hourly?.relative_humidity_2m?.[index]),
        precipitation_probability: toNumber(weatherData.hourly?.precipitation_probability?.[index]),
        precipitation: toNumber(weatherData.hourly?.precipitation?.[index]),
        weather_code: toNumber(weatherData.hourly?.weather_code?.[index]),
        wind_speed_10m: toNumber(weatherData.hourly?.wind_speed_10m?.[index]),
        uv_index: toNumber(weatherData.hourly?.uv_index?.[index]),
        is_day: toNumber(weatherData.hourly?.is_day?.[index]),
        ...airRow,
      };
    })
    .filter((row) => row.time?.slice(0, 10) === selectedDateKey);

  if (selectedDateKey === nowParts.dateKey) {
    const remainingRows = selectedRows.filter((row) => Number(row.time.slice(11, 13)) >= nowParts.hour);
    return remainingRows.length ? remainingRows : selectedRows;
  }

  return selectedRows;
}

function buildLocalizedRecommendation(text, locationName, activityId, bestWindow) {
  if (!bestWindow) {
    return "";
  }

  const activityLabel = text.activityOptions?.[activityId] || activityId;
  const reasonLabels = bestWindow.reasonIds
    .map((reasonId) => text.recommendationReasons?.[reasonId])
    .filter(Boolean);
  const reasons = reasonLabels.slice(0, 3);
  const reasonText = reasons.length ? `${text.recommendationBecause} ${joinPhraseList(reasons, text.andWord)}` : "";

  return `${text.recommendationLead} ${activityLabel.toLowerCase()} ${text.recommendationIn} ${locationName} ${text.recommendationAround} ${bestWindow.label}${reasonText}.`;
}

function joinPhraseList(items, andWord) {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} ${andWord} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, ${andWord} ${items[items.length - 1]}`;
}

function getCountryDisplayName(countryCode, locale) {
  try {
    const displayNames = new Intl.DisplayNames([locale, "en"], { type: "region" });
    return displayNames.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
}

export default function SafeRouteDailyTool({ text, locale, hideHeader = false }) {
  const dateOptions = createDateOptions(locale);
  const countryOptions = Object.keys(SAFE_ROUTE_LOCATIONS)
    .map((countryCode) => ({
      code: countryCode,
      label: getCountryDisplayName(countryCode, locale),
    }))
    .sort((left, right) => left.label.localeCompare(right.label, locale));
  const [countryCode, setCountryCode] = useState("FI");
  const cityOptions = SAFE_ROUTE_LOCATIONS[countryCode] || [];
  const [city, setCity] = useState("Helsinki");
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]?.value || "");
  const [activity, setActivity] = useState("walking");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedCity = city.trim();

    if (!trimmedCity) {
      setErrorMessage(text.locationNotFound);
      setResult(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setResult(null);

    try {
      const geocodeResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmedCity)}&count=1&language=en&format=json&countryCode=${countryCode}`
      );

      if (!geocodeResponse.ok) {
        throw new Error("geocoding-failed");
      }

      const geocodeData = await geocodeResponse.json();
      const location = Array.isArray(geocodeData?.results) ? geocodeData.results[0] : null;

      if (!Number.isFinite(location?.latitude) || !Number.isFinite(location?.longitude)) {
        setResult(null);
        setErrorMessage(text.locationNotFound);
        return;
      }

      const weatherUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}` +
        "&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index,is_day&timezone=auto&forecast_days=16";
      const airUrl =
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}` +
        "&hourly=pm10,pm2_5,nitrogen_dioxide,ozone,uv_index&timezone=auto&forecast_days=7";

      const [weatherResponse, airResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(airUrl).catch(() => null),
      ]);

      if (!weatherResponse.ok) {
        throw new Error("weather-failed");
      }

      const weatherData = await weatherResponse.json();
      const airQualityData = airResponse?.ok ? await airResponse.json() : null;
      const hourlyRows = buildWeatherRows(weatherData, airQualityData, weatherData?.timezone, selectedDate);

      if (!hourlyRows.length) {
        setResult(null);
        setErrorMessage(text.noForecastForDate);
        return;
      }

      const scoredHours = hourlyRows.map((hour) => calculateOutdoorScore(hour, activity));
      const bestWindow = getBestTimeWindow(scoredHours);
      const avoidWindow = getAvoidTimeWindow(scoredHours);
      const locationName = formatLocationName(location);
      const airQualityAvailable = scoredHours.some((hour) => hour.pm2_5 != null);
      const recommendation =
        locale === "fi"
          ? buildLocalizedRecommendation(text, locationName, activity, bestWindow)
          : generateRecommendation(locationName, activity, bestWindow);

      setResult({
        activity,
        airQualityAvailable,
        avoidWindow,
        bestWindow,
        forecastDate: formatForecastDate(selectedDate, locale),
        hourlyScores: scoredHours,
        locationName,
        recommendation,
        warnings: generateWarnings(scoredHours, activity),
      });
    } catch {
      setResult(null);
      setErrorMessage(text.loadError);
    } finally {
      setIsLoading(false);
    }
  }

  const scoreLabel = result?.bestWindow
    ? text.scoreLabels?.[getScoreLabel(result.bestWindow.averageScore)] || getScoreLabel(result.bestWindow.averageScore)
    : "";

  return (
    <section className="section shell" id="safe-route-daily" aria-label={hideHeader ? text.title : undefined}>
      <div className="glass-card safe-route-wrap">
        {!hideHeader ? (
          <>
            <h2>{text.title}</h2>
            <p className="section-subtitle">{text.subtitle}</p>
          </>
        ) : null}

        <div className={`safe-route-panel${hideHeader ? " is-headerless" : ""}`}>
          <form className="safe-route-form" onSubmit={handleSubmit}>
            <label className="safe-route-field">
              <span>{text.countryLabel}</span>
              <select
                value={countryCode}
                onChange={(event) => {
                  const nextCountryCode = event.target.value;
                  const nextCities = SAFE_ROUTE_LOCATIONS[nextCountryCode] || [];
                  setCountryCode(nextCountryCode);
                  setCity(nextCities[0] || "");
                }}
              >
                {countryOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="safe-route-field">
              <span>{text.cityLabel}</span>
              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                disabled={!cityOptions.length}
              >
                {cityOptions.length ? null : <option value="">{text.cityEmptyOption}</option>}
                {cityOptions.map((cityOption) => (
                  <option key={cityOption} value={cityOption}>
                    {cityOption}
                  </option>
                ))}
              </select>
            </label>

            <label className="safe-route-field">
              <span>{text.dateLabel}</span>
              <select value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)}>
                {dateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="safe-route-field">
              <span>{text.activityLabel}</span>
              <select value={activity} onChange={(event) => setActivity(event.target.value)}>
                {ACTIVITY_IDS.map((activityId) => (
                  <option key={activityId} value={activityId}>
                    {text.activityOptions?.[activityId] || activityId}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className="btn btn-primary safe-route-submit" disabled={isLoading}>
              {isLoading ? text.checking : text.checkButton}
            </button>
          </form>

          {errorMessage ? <p className="safe-route-message is-error">{errorMessage}</p> : null}
          {isLoading ? <p className="safe-route-message">{text.loadingMessage}</p> : null}

          {!result ? (
            <div className="safe-route-empty">
              <h3>{text.emptyTitle}</h3>
              <p>{text.emptySubtitle}</p>
            </div>
          ) : (
            <div className="safe-route-results">
              {!result.airQualityAvailable ? (
                <p className="safe-route-message is-note">{text.airQualityUnavailable}</p>
              ) : null}

              <div className="safe-route-summary-grid">
                <article className="safe-route-score-card safe-route-score-card-main">
                  <p className="safe-route-card-kicker">{text.mainScoreTitle}</p>
                  <h3>{result.bestWindow.averageScore} / 100</h3>
                  <p className="safe-route-score-label">{scoreLabel}</p>
                  <p className="safe-route-card-copy">{result.locationName}</p>
                  <p className="safe-route-card-copy">
                    {text.forecastDateLabel}: {result.forecastDate}
                  </p>
                </article>

                <article className="safe-route-score-card">
                  <p className="safe-route-card-kicker">{text.bestTimeTitle}</p>
                  <h3>{result.bestWindow?.label || "--"}</h3>
                  <p className="safe-route-card-copy">{text.bestTimeHint}</p>
                </article>

                <article className="safe-route-score-card">
                  <p className="safe-route-card-kicker">{text.avoidTimeTitle}</p>
                  <h3>{result.avoidWindow?.label || "--"}</h3>
                  <p className="safe-route-card-copy">{text.avoidTimeHint}</p>
                </article>
              </div>

              {result.warnings.length ? (
                <section className="safe-route-block">
                  <div className="safe-route-block-head">
                    <h3>{text.warningsTitle}</h3>
                  </div>
                  <div className="safe-route-warning-list">
                    {result.warnings.map((warningId) => (
                      <article className="safe-route-warning-card" key={warningId}>
                        <p>{text.warningMessages?.[warningId] || warningId}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="safe-route-block">
                <div className="safe-route-block-head">
                  <h3>{text.recommendationTitle}</h3>
                </div>
                <p className="safe-route-recommendation">{result.recommendation}</p>
              </section>

              <section className="safe-route-block">
                <div className="safe-route-block-head">
                  <h3>{text.hourlyTitle}</h3>
                </div>
                <div className="safe-route-hourly-grid">
                  {result.hourlyScores.map((hour) => {
                    const localizedLabel = text.scoreLabels?.[hour.label] || hour.label;

                    return (
                      <article className="safe-route-hour-card" key={hour.time}>
                        <div className="safe-route-hour-head">
                          <strong>{hour.time.slice(11, 16)}</strong>
                          <span className="safe-route-hour-score">{hour.score}</span>
                        </div>
                        <p className="safe-route-hour-label">{localizedLabel}</p>
                        <dl className="safe-route-hour-metrics">
                          <div>
                            <dt>{text.metricLabels?.temperature}</dt>
                            <dd>{formatMetric(hour.temperature_2m, " C")}</dd>
                          </div>
                          <div>
                            <dt>{text.metricLabels?.rain}</dt>
                            <dd>{formatMetric(hour.precipitation_probability, "%")}</dd>
                          </div>
                          <div>
                            <dt>{text.metricLabels?.wind}</dt>
                            <dd>{formatMetric(hour.wind_speed_10m, " km/h")}</dd>
                          </div>
                          <div>
                            <dt>{text.metricLabels?.uv}</dt>
                            <dd>{formatMetric(hour.uv_index, "", 1)}</dd>
                          </div>
                          <div>
                            <dt>{text.metricLabels?.humidity}</dt>
                            <dd>{formatMetric(hour.relative_humidity_2m, "%")}</dd>
                          </div>
                          <div>
                            <dt>{text.metricLabels?.pm25}</dt>
                            <dd>{formatMetric(hour.pm2_5, " ug/m3", 1)}</dd>
                          </div>
                        </dl>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="safe-route-disclaimer">
                <p>{text.disclaimer}</p>
              </section>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
