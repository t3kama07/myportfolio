const SCORE_LABELS = [
  { min: 80, label: "Excellent" },
  { min: 65, label: "Good" },
  { min: 50, label: "Moderate" },
  { min: 35, label: "Poor" },
  { min: 0, label: "Avoid if possible" },
];

const ACTIVITY_NAMES = {
  walking: "walking",
  cycling: "cycling",
  running: "running",
  "outdoor-work": "outdoor work",
  travel: "travel",
  "child-elderly-outing": "child / elderly outing",
};

const ACTIVITY_MULTIPLIERS = {
  walking: {},
  cycling: {
    rain: 1.15,
    wind: 1.2,
  },
  running: {
    temperature: 1.15,
    humidity: 1.2,
    air: 1.25,
  },
  "outdoor-work": {
    temperature: 1.15,
    rain: 1.15,
    wind: 1.2,
    uv: 1.25,
    air: 1.25,
  },
  travel: {
    rain: 1.15,
    daylightNight: 10,
  },
  "child-elderly-outing": {
    temperature: 1.15,
    rain: 1.15,
    uv: 1.25,
    air: 1.25,
  },
};

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getMultiplier(activity, key, fallback = 1) {
  return ACTIVITY_MULTIPLIERS[activity]?.[key] ?? fallback;
}

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function getTemperaturePenalty(temperature) {
  const value = toNumber(temperature);
  if (value === null) return 0;
  if (value >= 18 && value <= 24) return 0;
  if ((value >= 10 && value <= 17) || (value >= 25 && value <= 28)) return 8;
  if ((value >= 0 && value <= 9) || (value >= 29 && value <= 32)) return 18;
  return 30;
}

function getRainPenalty(precipitationProbability) {
  const value = toNumber(precipitationProbability);
  if (value === null) return 0;
  if (value <= 20) return 0;
  if (value <= 50) return 10;
  if (value <= 80) return 25;
  return 40;
}

function getWindPenalty(windSpeed) {
  const value = toNumber(windSpeed);
  if (value === null) return 0;
  if (value <= 15) return 0;
  if (value <= 30) return 10;
  if (value <= 45) return 25;
  return 40;
}

function getUvPenalty(uvIndex) {
  const value = toNumber(uvIndex);
  if (value === null) return 0;
  if (value <= 2) return 0;
  if (value <= 5) return 8;
  if (value <= 7) return 18;
  if (value <= 10) return 30;
  return 45;
}

function getAirQualityPenalty(pm25) {
  const value = toNumber(pm25);
  if (value === null) return 0;
  if (value <= 12) return 0;
  if (value <= 35.4) return 10;
  if (value <= 55.4) return 25;
  return 45;
}

function getDaylightPenalty(isDay, activity) {
  const value = toNumber(isDay);
  if (value === 1) return 0;
  if (activity === "travel") return 10;
  return 20;
}

function getHumidityPenalty(humidity) {
  const value = toNumber(humidity);
  if (value === null) return 0;
  if (value >= 30 && value <= 60) return 0;
  if ((value >= 61 && value <= 75) || value < 30) return 6;
  if (value >= 76 && value <= 85) return 12;
  return 20;
}

function multiplyPenalty(value, multiplier) {
  return Math.round(value * multiplier * 10) / 10;
}

function getWindowTimeLabel(hours) {
  if (!Array.isArray(hours) || hours.length === 0) {
    return "";
  }

  const start = String(hours[0].time || "").slice(11, 16);
  const lastHour = Number(String(hours[hours.length - 1].time || "").slice(11, 13));
  const nextHour = Number.isFinite(lastHour) ? `${String((lastHour + 1) % 24).padStart(2, "0")}:00` : "";
  return `${start} - ${nextHour}`;
}

function average(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function joinReasons(reasons) {
  if (reasons.length <= 1) return reasons[0] || "";
  if (reasons.length === 2) return `${reasons[0]} and ${reasons[1]}`;
  return `${reasons.slice(0, -1).join(", ")}, and ${reasons[reasons.length - 1]}`;
}

function getPreferredReasonOrder(activity) {
  if (activity === "cycling") {
    return ["low-rain", "comfortable-wind", "comfortable-temperature", "lower-uv", "daylight", "cleaner-air"];
  }

  if (activity === "running") {
    return [
      "cleaner-air",
      "comfortable-temperature",
      "balanced-humidity",
      "low-rain",
      "comfortable-wind",
      "lower-uv",
      "daylight",
    ];
  }

  if (activity === "outdoor-work") {
    return ["lower-uv", "comfortable-temperature", "low-rain", "comfortable-wind", "cleaner-air", "daylight"];
  }

  if (activity === "travel") {
    return ["low-rain", "comfortable-wind", "daylight", "comfortable-temperature", "cleaner-air", "lower-uv"];
  }

  if (activity === "child-elderly-outing") {
    return ["cleaner-air", "lower-uv", "comfortable-temperature", "low-rain", "daylight", "comfortable-wind"];
  }

  return ["comfortable-temperature", "low-rain", "comfortable-wind", "lower-uv", "cleaner-air", "daylight"];
}

function getWindowReasonIds(activity, hours) {
  if (!Array.isArray(hours) || hours.length === 0) {
    return [];
  }

  const avgTemperature = average(hours.map((hour) => hour.temperature_2m).filter(Number.isFinite));
  const avgRain = average(hours.map((hour) => hour.precipitation_probability).filter(Number.isFinite));
  const avgWind = average(hours.map((hour) => hour.wind_speed_10m).filter(Number.isFinite));
  const avgUv = average(hours.map((hour) => hour.uv_index).filter(Number.isFinite));
  const avgHumidity = average(hours.map((hour) => hour.relative_humidity_2m).filter(Number.isFinite));
  const avgPm25 = average(hours.map((hour) => hour.pm2_5).filter(Number.isFinite));
  const allDaylight = hours.every((hour) => toNumber(hour.is_day) === 1);
  const candidates = [];

  if (avgRain <= 20) candidates.push("low-rain");
  if (avgWind <= 18) candidates.push("comfortable-wind");
  if (avgTemperature >= 12 && avgTemperature <= 25) candidates.push("comfortable-temperature");
  if (avgUv <= 4) candidates.push("lower-uv");
  if (Number.isFinite(avgPm25) && avgPm25 <= 12) candidates.push("cleaner-air");
  if (avgHumidity >= 30 && avgHumidity <= 70) candidates.push("balanced-humidity");
  if (allDaylight) candidates.push("daylight");

  const preferredOrder = getPreferredReasonOrder(activity);

  return preferredOrder.filter((reasonId) => candidates.includes(reasonId)).slice(0, 3);
}

function createWindowResult(hours) {
  const scores = hours.map((hour) => hour.score);
  const averageScore = clampScore(average(scores));
  const minScore = Math.min(...scores);
  const maxPenalty = Math.max(...hours.map((hour) => hour.totalPenalty));

  return {
    averageScore,
    hours,
    label: getWindowTimeLabel(hours),
    minScore,
    maxPenalty,
    reasonIds: getWindowReasonIds(hours[0]?.activity, hours),
  };
}

function findWindow(hourlyScores, mode) {
  if (!Array.isArray(hourlyScores) || hourlyScores.length === 0) {
    return null;
  }

  const candidateLengths = hourlyScores.length >= 3 ? [3, 2] : hourlyScores.length >= 2 ? [2] : [1];
  let bestWindow = null;

  for (const length of candidateLengths) {
    for (let index = 0; index <= hourlyScores.length - length; index += 1) {
      const window = createWindowResult(hourlyScores.slice(index, index + length));

      if (!bestWindow) {
        bestWindow = window;
        continue;
      }

      if (mode === "best") {
        const isBetter =
          window.averageScore > bestWindow.averageScore ||
          (window.averageScore === bestWindow.averageScore && window.minScore > bestWindow.minScore) ||
          (window.averageScore === bestWindow.averageScore &&
            window.minScore === bestWindow.minScore &&
            window.hours.length > bestWindow.hours.length);

        if (isBetter) {
          bestWindow = window;
        }
      } else {
        const isWorse =
          window.averageScore < bestWindow.averageScore ||
          (window.averageScore === bestWindow.averageScore && window.maxPenalty > bestWindow.maxPenalty) ||
          (window.averageScore === bestWindow.averageScore &&
            window.maxPenalty === bestWindow.maxPenalty &&
            window.hours.length > bestWindow.hours.length);

        if (isWorse) {
          bestWindow = window;
        }
      }
    }
  }

  return bestWindow;
}

function getReasonPhrases(reasonIds) {
  const phrases = {
    "low-rain": "rain risk is low",
    "comfortable-wind": "wind conditions are comfortable",
    "comfortable-temperature": "the temperature is comfortable",
    "lower-uv": "UV is lower",
    "cleaner-air": "air quality is better",
    "balanced-humidity": "humidity feels more balanced",
    daylight: "daylight is better",
  };

  return reasonIds.map((reasonId) => phrases[reasonId]).filter(Boolean);
}

export function calculateOutdoorScore(hourData, activity = "walking") {
  const temperaturePenalty = multiplyPenalty(
    getTemperaturePenalty(hourData.temperature_2m),
    getMultiplier(activity, "temperature")
  );
  const rainPenalty = multiplyPenalty(
    getRainPenalty(hourData.precipitation_probability),
    getMultiplier(activity, "rain")
  );
  const windPenalty = multiplyPenalty(getWindPenalty(hourData.wind_speed_10m), getMultiplier(activity, "wind"));
  const uvPenalty = multiplyPenalty(getUvPenalty(hourData.uv_index), getMultiplier(activity, "uv"));
  const airQualityPenalty = hourData.pm2_5 == null
    ? 0
    : multiplyPenalty(getAirQualityPenalty(hourData.pm2_5), getMultiplier(activity, "air"));
  const humidityPenalty = multiplyPenalty(
    getHumidityPenalty(hourData.relative_humidity_2m),
    getMultiplier(activity, "humidity")
  );
  const daylightPenalty = getDaylightPenalty(hourData.is_day, activity);
  const totalPenalty =
    temperaturePenalty +
    rainPenalty +
    windPenalty +
    uvPenalty +
    airQualityPenalty +
    humidityPenalty +
    daylightPenalty;
  const score = clampScore(100 - totalPenalty);

  return {
    ...hourData,
    activity,
    penalties: {
      temperature: temperaturePenalty,
      rain: rainPenalty,
      wind: windPenalty,
      uv: uvPenalty,
      air: airQualityPenalty,
      humidity: humidityPenalty,
      daylight: daylightPenalty,
    },
    totalPenalty,
    score,
    label: getScoreLabel(score),
  };
}

export function getScoreLabel(score) {
  return SCORE_LABELS.find((item) => score >= item.min)?.label || SCORE_LABELS[SCORE_LABELS.length - 1].label;
}

export function getBestTimeWindow(hourlyScores) {
  return findWindow(hourlyScores, "best");
}

export function getAvoidTimeWindow(hourlyScores) {
  return findWindow(hourlyScores, "avoid");
}

export function generateWarnings(hourlyScores) {
  if (!Array.isArray(hourlyScores) || hourlyScores.length === 0) {
    return [];
  }

  const warnings = [];

  if (hourlyScores.some((hour) => toNumber(hour.uv_index) >= 8 && Number(String(hour.time || "").slice(11, 13)) >= 11)) {
    warnings.push("high-uv");
  }

  if (hourlyScores.some((hour) => toNumber(hour.precipitation_probability) >= 51 || toNumber(hour.precipitation) >= 1.5)) {
    warnings.push("rain-risk");
  }

  if (hourlyScores.some((hour) => toNumber(hour.wind_speed_10m) > 30)) {
    warnings.push("strong-wind");
  }

  if (hourlyScores.some((hour) => toNumber(hour.pm2_5) > 35.4)) {
    warnings.push("poor-air");
  }

  if (hourlyScores.some((hour) => toNumber(hour.temperature_2m) < 0)) {
    warnings.push("cold-temperature");
  }

  if (hourlyScores.some((hour) => toNumber(hour.temperature_2m) > 32)) {
    warnings.push("hot-temperature");
  }

  if (hourlyScores.some((hour) => toNumber(hour.is_day) === 0)) {
    warnings.push("low-daylight");
  }

  if (hourlyScores.some((hour) => toNumber(hour.relative_humidity_2m) > 85)) {
    warnings.push("high-humidity");
  }

  return warnings;
}

export function generateRecommendation(locationName, activity, bestWindow) {
  if (!bestWindow) {
    return "";
  }

  const reasons = getReasonPhrases(bestWindow.reasonIds);
  const readableActivity = ACTIVITY_NAMES[activity] || ACTIVITY_NAMES.walking;
  const reasonText = reasons.length ? ` because ${joinReasons(reasons)}.` : ".";

  return `The best time for ${readableActivity} in ${locationName} is around ${bestWindow.label}${reasonText}`;
}
