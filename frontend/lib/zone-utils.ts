import { sikkimZones } from "./mock-data"
import sikkimData from "./database/sikkim-data.json"
import type { SikkimZone } from "./types"

// Calculate distance between two GPS coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Determine Sikkim zone based on GPS coordinates
export function getSikkimZone(latitude: number, longitude: number): SikkimZone | null {
  let closestZone: SikkimZone | null = null
  let minDistance = Number.POSITIVE_INFINITY

  for (const zone of sikkimZones) {
    const distance = calculateDistance(latitude, longitude, zone.coordinates.lat, zone.coordinates.lon)

    if (distance < minDistance) {
      minDistance = distance
      closestZone = zone
    }
  }

  return closestZone
}

// Get slope category based on elevation difference
export function getSlopeCategory(elevation: number): "high" | "medium" | "low" {
  if (elevation > 1500) return "high"
  if (elevation > 800) return "medium"
  return "low"
}

// Get crop recommendations based on zone and slope
export function getCropRecommendations(
  latitude: number,
  longitude: number,
  elevation: number,
  soilType?: string,
): {
  zone: SikkimZone | null
  slope: "high" | "medium" | "low"
  recommendedCrops: string[]
  waterRequirement: number
  irrigationFrequency: string
} {
  const zone = getSikkimZone(latitude, longitude)
  const slope = getSlopeCategory(elevation)

  // Get slope-based recommendations from database
  const slopeData = sikkimData.slope_recommendations[`${slope}_slope`]

  // Combine zone and slope recommendations
  let recommendedCrops: string[] = []
  if (zone) {
    recommendedCrops = [...zone.suitable_crops]
  }

  if (slopeData) {
    // Merge with slope-specific crops, avoiding duplicates
    const slopeCrops = slopeData.suitable_crops.filter((crop) => !recommendedCrops.includes(crop))
    recommendedCrops = [...recommendedCrops, ...slopeCrops]
  }

  // Calculate water requirement based on slope and zone climate
  let baseWaterRequirement = 100 // liters per day base
  if (zone) {
    // Adjust based on zone precipitation
    const precipitationFactor = zone.climate.precipitation.annual_mm / 1500
    baseWaterRequirement = baseWaterRequirement / precipitationFactor
  }

  // Adjust based on slope
  const slopeMultiplier = slope === "low" ? 1.5 : slope === "medium" ? 1.0 : 0.7
  const waterRequirement = Math.round(baseWaterRequirement * slopeMultiplier)

  return {
    zone,
    slope,
    recommendedCrops,
    waterRequirement,
    irrigationFrequency: slopeData?.irrigation_frequency || "regular",
  }
}

// Get detailed crop information from database
export function getCropDetails(cropName: string) {
  const cropKey = cropName.toLowerCase().replace(/\s+/g, "_")
  return sikkimData.crops[cropKey as keyof typeof sikkimData.crops] || null
}

// Generate planting calendar based on crop and zone
export function generatePlantingCalendar(
  cropName: string,
  zone: SikkimZone | null,
): {
  bestPlantingMonths: string[]
  harvestMonths: string[]
  growthDuration: number
} {
  const cropDetails = getCropDetails(cropName)

  if (!cropDetails || !zone) {
    return {
      bestPlantingMonths: ["March", "April"],
      harvestMonths: ["July", "August"],
      growthDuration: 120,
    }
  }

  const totalDuration = cropDetails.growth_stages.reduce((sum, stage) => sum + stage.duration_days, 0)

  // Determine best planting months based on zone climate
  let bestPlantingMonths: string[] = []

  if (zone.climate.temperature.min >= cropDetails.temperature.min) {
    // Can plant year-round in suitable temperature zones
    bestPlantingMonths = ["March", "April", "May", "September", "October"]
  } else {
    // Limited to warmer months
    bestPlantingMonths = ["April", "May", "June"]
  }

  // Calculate harvest months
  const harvestMonths: string[] = []
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  bestPlantingMonths.forEach((plantMonth) => {
    const plantIndex = monthNames.indexOf(plantMonth)
    const harvestIndex = (plantIndex + Math.floor(totalDuration / 30)) % 12
    const harvestMonth = monthNames[harvestIndex]
    if (!harvestMonths.includes(harvestMonth)) {
      harvestMonths.push(harvestMonth)
    }
  })

  return {
    bestPlantingMonths,
    harvestMonths,
    growthDuration: totalDuration,
  }
}
