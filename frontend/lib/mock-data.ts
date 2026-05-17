import type {
  IrrigationBox,
  SensorReading,
  CropProfile,
  Alert,
  WeatherData,
  WaterTank,
  WaterUsage,
  SikkimZone,
  PlotSubzone,
} from "./types"

import sikkimData from "./database/sikkim-data.json"

export const mockBoxes: IrrigationBox[] = [
  {
    id: "box-001",
    name: "North Field Box",
    location: {
      latitude: 27.3389,
      longitude: 88.6065,
      address: "Gangtok, Sikkim, India",
    },
    status: "online",
    lastSeen: new Date(),
    firmwareVersion: "2.1.3",
    batteryLevel: 85,
    signalStrength: 78,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "box-002",
    name: "South Field Box",
    location: {
      latitude: 27.335,
      longitude: 88.61,
      address: "Ranipool, Sikkim, India",
    },
    status: "online",
    lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    firmwareVersion: "2.1.3",
    batteryLevel: 92,
    signalStrength: 85,
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "box-003",
    name: "Greenhouse Box",
    location: {
      latitude: 27.34,
      longitude: 88.608,
      address: "Tadong, Sikkim, India",
    },
    status: "offline",
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    firmwareVersion: "2.0.8",
    batteryLevel: 23,
    signalStrength: 45,
    createdAt: new Date("2024-02-01"),
  },
]

export const mockSensorReadings: SensorReading[] = [
  {
    id: "reading-001",
    boxId: "box-001",
    timestamp: new Date(),
    soilMoisture: 65,
    soilTemperature: 22,
    ambientTemperature: 25,
    humidity: 78,
    lightIntensity: 45000,
    phLevel: 6.8,
    electricalConductivity: 1.2,
  },
  {
    id: "reading-002",
    boxId: "box-002",
    timestamp: new Date(),
    soilMoisture: 45,
    soilTemperature: 24,
    ambientTemperature: 27,
    humidity: 82,
    lightIntensity: 52000,
    phLevel: 7.1,
    electricalConductivity: 1.4,
  },
]

export const mockCropProfiles: CropProfile[] = [
  {
    id: "crop-001",
    name: "Tomato",
    variety: "Cherry Tomato",
    plantingDate: new Date("2024-03-01"),
    harvestDate: new Date("2024-06-15"),
    optimalMoisture: { min: 60, max: 80 },
    optimalTemperature: { min: 18, max: 26 },
    growthStages: [
      { stage: "Seedling", duration: 14, waterRequirement: 0.5 },
      { stage: "Vegetative", duration: 35, waterRequirement: 1.5 },
      { stage: "Flowering", duration: 21, waterRequirement: 2.0 },
      { stage: "Fruiting", duration: 35, waterRequirement: 2.5 },
    ],
    eepromData: "0x4A5B6C7D8E9F",
  },
  {
    id: "crop-002",
    name: "Lettuce",
    variety: "Butterhead",
    plantingDate: new Date("2024-03-15"),
    harvestDate: new Date("2024-05-15"),
    optimalMoisture: { min: 70, max: 85 },
    optimalTemperature: { min: 15, max: 22 },
    growthStages: [
      { stage: "Germination", duration: 7, waterRequirement: 0.3 },
      { stage: "Leaf Development", duration: 28, waterRequirement: 1.0 },
      { stage: "Head Formation", duration: 25, waterRequirement: 1.2 },
    ],
    eepromData: "0x1A2B3C4D5E6F",
  },
]

export const mockAlerts: Alert[] = [
  {
    id: "alert-001",
    boxId: "box-002",
    type: "low_moisture",
    severity: "medium",
    message: "Soil moisture level is below optimal range (45%)",
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: "alert-002",
    boxId: "box-003",
    type: "offline",
    severity: "high",
    message: "Irrigation box has been offline for 2 hours",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "alert-003",
    boxId: "box-003",
    type: "low_battery",
    severity: "critical",
    message: "Battery level critically low (23%)",
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
]

export const mockWeatherData: WeatherData = {
  location: "Gangtok, Sikkim",
  temperature: 22,
  humidity: 75,
  rainfall: 2.5,
  windSpeed: 8,
  forecast: [
    {
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      temperature: { min: 18, max: 25 },
      humidity: 78,
      rainfall: 1.2,
    },
    {
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      temperature: { min: 20, max: 27 },
      humidity: 72,
      rainfall: 0,
    },
  ],
  updatedAt: new Date(),
}

export const mockWaterTanks: WaterTank[] = [
  {
    id: "tank-001",
    name: "Main Rainwater Tank",
    boxId: "box-001",
    capacity: 5000,
    currentLevel: 3750,
    levelPercentage: 75,
    sensorType: "ultrasonic",
    location: {
      latitude: 27.3389,
      longitude: 88.6065,
      elevation: 1650,
    },
    alerts: {
      lowLevel: 20,
      highLevel: 90,
      criticalLevel: 10,
    },
    lastUpdated: new Date(),
    status: "active",
  },
  {
    id: "tank-002",
    name: "Secondary Storage Tank",
    boxId: "box-002",
    capacity: 3000,
    currentLevel: 450,
    levelPercentage: 15,
    sensorType: "float",
    location: {
      latitude: 27.335,
      longitude: 88.61,
      elevation: 1580,
    },
    alerts: {
      lowLevel: 25,
      highLevel: 85,
      criticalLevel: 15,
    },
    lastUpdated: new Date(Date.now() - 10 * 60 * 1000),
    status: "active",
  },
  {
    id: "tank-003",
    name: "Greenhouse Water Tank",
    boxId: "box-003",
    capacity: 2000,
    currentLevel: 1800,
    levelPercentage: 90,
    sensorType: "pressure",
    location: {
      latitude: 27.34,
      longitude: 88.608,
      elevation: 1620,
    },
    alerts: {
      lowLevel: 30,
      highLevel: 95,
      criticalLevel: 20,
    },
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "maintenance",
  },
]

export const mockWaterUsage: WaterUsage[] = [
  {
    id: "usage-001",
    tankId: "tank-001",
    boxId: "box-001",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    amountUsed: 150,
    purpose: "irrigation",
    cropType: "Tomato",
    efficiency: 85,
  },
  {
    id: "usage-002",
    tankId: "tank-002",
    boxId: "box-002",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    amountUsed: 200,
    purpose: "irrigation",
    cropType: "Lettuce",
    efficiency: 78,
  },
  {
    id: "usage-003",
    tankId: "tank-001",
    boxId: "box-001",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    amountUsed: 75,
    purpose: "emergency",
    cropType: "Tomato",
    efficiency: 90,
  },
]

export const sikkimZones: SikkimZone[] = sikkimData.zones

export const mockPlotSubzones: PlotSubzone[] = [
  {
    id: "subzone-001",
    plotId: "plot-001",
    name: "Upper Terrace",
    slope: "high",
    elevation: 1680,
    area: 500,
    soilType: "Well-drained",
    recommendedCrops: ["Ginger", "Turmeric", "Large Cardamom"],
    irrigationPriority: 3,
    waterRequirement: 50,
    coordinates: [
      { lat: 27.3389, lon: 88.6065 },
      { lat: 27.339, lon: 88.6066 },
      { lat: 27.3391, lon: 88.6065 },
      { lat: 27.339, lon: 88.6064 },
    ],
  },
  {
    id: "subzone-002",
    plotId: "plot-001",
    name: "Middle Terrace",
    slope: "medium",
    elevation: 1620,
    area: 800,
    soilType: "Sandy-loam",
    recommendedCrops: ["Orange", "Lemon", "Vegetables", "Maize"],
    irrigationPriority: 1,
    waterRequirement: 120,
    coordinates: [
      { lat: 27.3385, lon: 88.606 },
      { lat: 27.3387, lon: 88.6062 },
      { lat: 27.3388, lon: 88.606 },
      { lat: 27.3386, lon: 88.6058 },
    ],
  },
  {
    id: "subzone-003",
    plotId: "plot-001",
    name: "Lower Field",
    slope: "low",
    elevation: 1580,
    area: 1200,
    soilType: "Clay",
    recommendedCrops: ["Paddy", "Finger Millet", "Leafy Greens"],
    irrigationPriority: 2,
    waterRequirement: 200,
    coordinates: [
      { lat: 27.338, lon: 88.6055 },
      { lat: 27.3383, lon: 88.6058 },
      { lat: 27.3384, lon: 88.6055 },
      { lat: 27.3381, lon: 88.6052 },
    ],
  },
]
