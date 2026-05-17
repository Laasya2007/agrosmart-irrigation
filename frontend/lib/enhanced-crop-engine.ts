import { classifyGPSZone, getZoneBasedCropRecommendations } from "./gps-zone-classifier"
import sikkimData from "./database/sikkim-data.json"

export interface CropScore {
  crop: string
  score: number // 0-100
  suitabilityLevel: "excellent" | "good" | "moderate" | "poor"
  reasons: string[]
  yieldPotential: "high" | "medium" | "low"
  riskFactors: string[]
  recommendations: string[]
}

export interface EnhancedCropRecommendation {
  location: {
    zone: string
    slope: string
    confidence: string
  }
  environmental: {
    temperature_match: number
    precipitation_match: number
    elevation_suitability: number
  }
  cropScores: CropScore[]
  seasonalPlanning: {
    currentSeason: string
    nextPlantingWindow: string
    cropRotationSuggestions: string[]
  }
  marketInsights: {
    demandLevel: "high" | "medium" | "low"
    priceStability: "stable" | "volatile"
    marketAccess: "excellent" | "good" | "limited"
  }
  sustainabilityScore: number // 0-100
}

// Calculate crop suitability score based on multiple factors
function calculateCropScore(
  cropName: string,
  latitude: number,
  longitude: number,
  elevation: number,
  soilType: string,
  plotArea: number,
  currentMonth: number,
): CropScore {
  const cropKey = cropName.toLowerCase().replace(/\s+/g, "_")
  const cropData = sikkimData.crops[cropKey as keyof typeof sikkimData.crops]

  let score = 50 // Base score
  const reasons: string[] = []
  const riskFactors: string[] = []
  const recommendations: string[] = []

  // Zone-based scoring
  const zoneClassification = classifyGPSZone(latitude, longitude)
  const zoneRecommendations = getZoneBasedCropRecommendations(latitude, longitude, elevation, plotArea)

  if (zoneRecommendations.recommendedCrops.includes(cropName)) {
    score += 20
    reasons.push(`Recommended for ${zoneClassification.zone.name}`)
  }

  // Climate matching
  if (cropData) {
    const zoneTemp = zoneClassification.zone.climate.temperature
    const cropTemp = cropData.temperature || { min: 15, max: 30 }

    if (zoneTemp.min >= cropTemp.min && zoneTemp.max <= cropTemp.max) {
      score += 15
      reasons.push("Optimal temperature range")
    } else if (zoneTemp.min < cropTemp.min || zoneTemp.max > cropTemp.max) {
      score -= 10
      riskFactors.push("Temperature stress risk")
    }

    // Soil type matching
    if (
      cropData.soil_type &&
      cropData.soil_type.some(
        (soil) =>
          soil.toLowerCase().includes(soilType.toLowerCase()) || soilType.toLowerCase().includes(soil.toLowerCase()),
      )
    ) {
      score += 10
      reasons.push("Suitable soil type")
    }
  }

  // Elevation-based scoring
  const slopeCategory = zoneRecommendations.slope
  if (slopeCategory === "high" && ["Ginger", "Turmeric", "Large Cardamom"].includes(cropName)) {
    score += 15
    reasons.push("Excellent for high elevation spice cultivation")
  } else if ((slopeCategory === "medium" && cropName.includes("Orange")) || cropName.includes("Lemon")) {
    score += 15
    reasons.push("Ideal slope for fruit cultivation")
  } else if (slopeCategory === "low" && cropName.includes("Paddy")) {
    score += 15
    reasons.push("Perfect for water-intensive crops")
  }

  // Seasonal timing
  const bestMonths = [3, 4, 5, 9, 10] // March, April, May, September, October
  if (bestMonths.includes(currentMonth)) {
    score += 5
    reasons.push("Good planting season")
  } else if ([12, 1, 2].includes(currentMonth)) {
    score -= 5
    riskFactors.push("Cold season planting risk")
  }

  // Market demand simulation (simplified)
  const highDemandCrops = ["Orange", "Ginger", "Large Cardamom", "Vegetables"]
  if (highDemandCrops.some((crop) => cropName.includes(crop))) {
    score += 10
    reasons.push("High market demand")
  }

  // Generate recommendations
  if (score < 60) {
    recommendations.push("Consider alternative crops with better suitability")
    recommendations.push("Implement soil improvement measures")
  } else if (score > 80) {
    recommendations.push("Excellent choice - maximize planting area")
    recommendations.push("Consider value-added processing")
  }

  // Determine suitability level
  let suitabilityLevel: CropScore["suitabilityLevel"]
  if (score >= 80) suitabilityLevel = "excellent"
  else if (score >= 65) suitabilityLevel = "good"
  else if (score >= 50) suitabilityLevel = "moderate"
  else suitabilityLevel = "poor"

  // Determine yield potential
  let yieldPotential: CropScore["yieldPotential"]
  if (score >= 75 && reasons.includes("Optimal temperature range")) yieldPotential = "high"
  else if (score >= 60) yieldPotential = "medium"
  else yieldPotential = "low"

  return {
    crop: cropName,
    score: Math.min(100, Math.max(0, score)),
    suitabilityLevel,
    reasons,
    yieldPotential,
    riskFactors,
    recommendations,
  }
}

// Generate comprehensive crop recommendations
export function generateEnhancedCropRecommendations(
  latitude: number,
  longitude: number,
  elevation: number,
  plotArea = 1000,
  soilType = "loamy",
  currentMonth: number = new Date().getMonth() + 1,
): EnhancedCropRecommendation {
  const zoneClassification = classifyGPSZone(latitude, longitude)
  const zoneRecommendations = getZoneBasedCropRecommendations(latitude, longitude, elevation, plotArea)

  // Get all possible crops from zone and slope recommendations
  const allCrops = [...new Set([...zoneClassification.zone.suitable_crops, ...zoneRecommendations.recommendedCrops])]

  // Calculate scores for all crops
  const cropScores = allCrops
    .map((crop) => calculateCropScore(crop, latitude, longitude, elevation, soilType, plotArea, currentMonth))
    .sort((a, b) => b.score - a.score)

  // Environmental matching scores
  const zoneTemp = zoneClassification.zone.climate.temperature
  const temperature_match = Math.max(0, 100 - Math.abs(25 - (zoneTemp.min + zoneTemp.max) / 2) * 4)
  const precipitation_match = Math.min(100, zoneClassification.zone.climate.precipitation.annual_mm / 15)
  const elevation_suitability = elevation > 2000 ? 60 : elevation < 500 ? 70 : 90

  // Seasonal planning
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const currentSeason =
    currentMonth <= 3 || currentMonth >= 11
      ? "Winter"
      : currentMonth <= 6
        ? "Spring"
        : currentMonth <= 9
          ? "Summer"
          : "Autumn"

  const nextPlantingWindow =
    currentMonth < 4 ? "March-May" : currentMonth < 7 ? "September-October" : "March-May (next year)"

  // Crop rotation suggestions based on top crops
  const topCrops = cropScores.slice(0, 3).map((cs) => cs.crop)
  const cropRotationSuggestions = [
    `${topCrops[0]} → Legumes → ${topCrops[1]}`,
    `${topCrops[1]} → Fallow → ${topCrops[2]}`,
    "Include nitrogen-fixing crops between main crops",
  ]

  // Market insights (simplified simulation)
  const marketInsights = {
    demandLevel:
      cropScores[0]?.score > 80
        ? ("high" as const)
        : cropScores[0]?.score > 60
          ? ("medium" as const)
          : ("low" as const),
    priceStability: zoneClassification.confidence === "high" ? ("stable" as const) : ("volatile" as const),
    marketAccess: zoneClassification.zone.name.includes("South")
      ? ("excellent" as const)
      : zoneClassification.zone.name.includes("East")
        ? ("good" as const)
        : ("limited" as const),
  }

  // Sustainability score based on environmental factors and crop diversity
  const sustainabilityScore = Math.round(
    temperature_match * 0.3 +
      precipitation_match * 0.3 +
      elevation_suitability * 0.2 +
      cropScores.filter((cs) => cs.suitabilityLevel === "excellent").length * 5 * 0.2,
  )

  return {
    location: {
      zone: zoneClassification.zone.name,
      slope: zoneRecommendations.slope,
      confidence: zoneClassification.confidence,
    },
    environmental: {
      temperature_match,
      precipitation_match,
      elevation_suitability,
    },
    cropScores,
    seasonalPlanning: {
      currentSeason,
      nextPlantingWindow,
      cropRotationSuggestions,
    },
    marketInsights,
    sustainabilityScore,
  }
}

// Get detailed crop information with growth stages
export function getCropGrowthDetails(cropName: string) {
  const cropKey = cropName.toLowerCase().replace(/\s+/g, "_")
  const cropData = sikkimData.crops[cropKey as keyof typeof sikkimData.crops]

  if (!cropData) {
    return {
      name: cropName,
      growth_stages: [
        { stage: "Planting", duration_days: 30, water_requirement_mm: 50 },
        { stage: "Growth", duration_days: 60, water_requirement_mm: 70 },
        { stage: "Maturity", duration_days: 30, water_requirement_mm: 40 },
      ],
      total_days: 120,
      water_schedule: "Regular irrigation every 2-3 days",
    }
  }

  const totalDays = cropData.growth_stages
    ? cropData.growth_stages.reduce((sum, stage) => sum + stage.duration_days, 0)
    : cropData.total_growth_days || 120

  return {
    name: cropName,
    growth_stages: cropData.growth_stages || [],
    total_days: totalDays,
    water_schedule: `Irrigate every ${cropData.recommended_irrigation_frequency_days || 2} days`,
    notes: cropData.notes || "Follow standard cultivation practices",
  }
}
