import { Router, type IRouter } from "express";
import { GetWeatherQueryParams, GetWeatherResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// Weather conditions by time of day (mock but realistic for Nigeria)
const weatherScenarios = [
  {
    condition: "Sunny",
    icon: "sun",
    pitchCondition: "Perfect for play",
    tempRange: [28, 35],
    humidity: 60,
    windSpeed: 12,
  },
  {
    condition: "Partly Cloudy",
    icon: "cloud-sun",
    pitchCondition: "Excellent conditions",
    tempRange: [26, 31],
    humidity: 68,
    windSpeed: 15,
  },
  {
    condition: "Overcast",
    icon: "cloud",
    pitchCondition: "Good conditions, cooler",
    tempRange: [24, 28],
    humidity: 75,
    windSpeed: 18,
  },
  {
    condition: "Light Rain",
    icon: "cloud-rain",
    pitchCondition: "Wet pitch expected - tread carefully",
    tempRange: [22, 26],
    humidity: 88,
    windSpeed: 22,
  },
  {
    condition: "Hot & Humid",
    icon: "thermometer",
    pitchCondition: "Very warm - stay hydrated",
    tempRange: [33, 38],
    humidity: 80,
    windSpeed: 8,
  },
];

const cityData: Record<string, { lat: number; lon: number; defaultScenarioIndex: number }> = {
  Lagos: { lat: 6.5244, lon: 3.3792, defaultScenarioIndex: 0 },
  Abuja: { lat: 9.0765, lon: 7.3986, defaultScenarioIndex: 1 },
  "Port Harcourt": { lat: 4.8156, lon: 7.0498, defaultScenarioIndex: 2 },
  Enugu: { lat: 6.4584, lon: 7.5464, defaultScenarioIndex: 1 },
};

router.get("/weather", async (req, res): Promise<void> => {
  const query = GetWeatherQueryParams.safeParse(req.query);
  const cityName = (query.success && query.data.city) ? query.data.city : "Lagos";

  const cityInfo = cityData[cityName] ?? cityData["Lagos"]!;
  const hour = new Date().getHours();

  // Vary scenario based on hour + city index for realism
  const scenarioIndex = (cityInfo.defaultScenarioIndex + Math.floor(hour / 6)) % weatherScenarios.length;
  const scenario = weatherScenarios[scenarioIndex]!;

  const tempMin = scenario.tempRange[0]!;
  const tempMax = scenario.tempRange[1]!;
  const temperature = Math.round(tempMin + (tempMax - tempMin) * ((hour % 12) / 12));

  const weather = {
    city: cityName,
    condition: scenario.condition,
    temperature,
    humidity: scenario.humidity,
    windSpeed: scenario.windSpeed,
    icon: scenario.icon,
    pitchCondition: scenario.pitchCondition,
    updatedAt: new Date().toISOString(),
  };

  res.json(GetWeatherResponse.parse(weather));
});

export default router;
