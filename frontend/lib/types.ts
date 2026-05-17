export interface IrrigationBox {
  id: string
  name: string
  location: {
    latitude: number
    longitude: number
    address: string
  }
  status: "online" | "offline" | "maintenance"
  lastSeen: Date
  firmwareVersion: string
  batteryLevel: number
  signalStrength: number
  createdAt: Date
}

export interface SensorReading {
  id: string
  boxId: string
  timestamp: Date
  soilMoisture: number // percentage 0-100
  soilTemperature: number // celsius
  ambientTemperature: number // celsius
  humidity: number // percentage 0-100
  lightIntensity: number // lux
  phLevel: number // 0-14
  electricalConductivity: number // mS/cm
}

export interface CropProfile {
  id: string
  name: string
  variety: string
  plantingDate: Date
  harvestDate: Date
  optimalMoisture: {
    min: number
    max: number
  }
  optimalTemperature: {
    min: number
    max: number
  }
  growthStages: {
    stage: string
    duration: number // days
    waterRequirement: number // liters per day
  }[]
  eepromData: string // hex string for EEPROM programming
}

export interface IrrigationSchedule {
  id: string
  boxId: string
  cropProfileId: string
  isActive: boolean
  scheduleType: "time-based" | "sensor-based" | "hybrid"
  timeSlots: {
    startTime: string
    duration: number // minutes
    days: number[] // 0-6 (Sunday-Saturday)
  }[]
  sensorThresholds: {
    moistureMin: number
    moistureMax: number
    temperatureMax: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface Alert {
  id: string
  boxId: string
  type: "low_moisture" | "high_temperature" | "low_battery" | "offline" | "system_error"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  isRead: boolean
  createdAt: Date
  resolvedAt?: Date
}

export interface IrrigationEvent {
  id: string
  boxId: string
  startTime: Date
  endTime?: Date
  duration: number // minutes
  waterAmount: number // liters
  trigger: "manual" | "scheduled" | "sensor" | "emergency"
  status: "running" | "completed" | "failed" | "cancelled"
}

export interface WeatherData {
  location: string
  temperature: number
  humidity: number
  rainfall: number
  windSpeed: number
  forecast: {
    date: Date
    temperature: { min: number; max: number }
    humidity: number
    rainfall: number
  }[]
  updatedAt: Date
}

export interface WaterTank {
  id: string
  name: string
  boxId: string
  capacity: number // liters
  currentLevel: number // liters
  levelPercentage: number // 0-100
  sensorType: "ultrasonic" | "float" | "pressure"
  location: {
    latitude: number
    longitude: number
    elevation: number // meters above sea level
  }
  alerts: {
    lowLevel: number // percentage threshold
    highLevel: number // percentage threshold
    criticalLevel: number // percentage threshold
  }
  lastUpdated: Date
  status: "active" | "maintenance" | "error"
}

export interface WaterUsage {
  id: string
  tankId: string
  boxId: string
  timestamp: Date
  amountUsed: number // liters
  purpose: "irrigation" | "emergency" | "maintenance"
  cropType?: string
  efficiency: number // percentage
}

export interface SikkimZone {
  id: string
  name: string
  description: string
  coordinates: {
    lat: number
    lon: number
  }
  suitable_crops: string[]
  climate: {
    temperature: { min: number; max: number }
    precipitation: { annual_mm: number }
    humidity: { avg: number }
  }
}

export interface PlotSubzone {
  id: string
  plotId: string
  name: string
  slope: "high" | "medium" | "low"
  elevation: number // meters
  area: number // square meters
  soilType: string
  recommendedCrops: string[]
  irrigationPriority: number // 1-5 (1 = highest priority)
  waterRequirement: number // liters per day
  coordinates: {
    lat: number
    lon: number
  }[]
}
