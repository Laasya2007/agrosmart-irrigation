import { getZoneBasedCropRecommendations } from "./gps-zone-classifier"

export interface TerrainAnalysis {
  slope_percentage: number
  slope_category: "gentle" | "moderate" | "steep" | "very_steep"
  drainage_quality: "excellent" | "good" | "moderate" | "poor"
  erosion_risk: "low" | "medium" | "high" | "critical"
  water_retention: "high" | "medium" | "low"
  accessibility: "easy" | "moderate" | "difficult"
}

export interface SlopeAnalysisResult {
  terrain: TerrainAnalysis
  irrigation_recommendations: {
    method: "drip" | "sprinkler" | "flood" | "micro_spray"
    frequency: "daily" | "alternate" | "weekly"
    duration_minutes: number
    water_pressure: "low" | "medium" | "high"
  }
  crop_suitability: {
    excellent: string[]
    good: string[]
    moderate: string[]
    poor: string[]
  }
  conservation_measures: string[]
  estimated_yield_factor: number // 0.5 to 1.5 multiplier
}

// Calculate slope percentage from elevation data
export function calculateSlopePercentage(elevationPoints: { elevation: number; distance: number }[]): number {
  if (elevationPoints.length < 2) return 0

  let totalRise = 0
  let totalRun = 0

  for (let i = 1; i < elevationPoints.length; i++) {
    const rise = Math.abs(elevationPoints[i].elevation - elevationPoints[i - 1].elevation)
    const run = elevationPoints[i].distance - elevationPoints[i - 1].distance
    totalRise += rise
    totalRun += run
  }

  return totalRun > 0 ? (totalRise / totalRun) * 100 : 0
}

// Analyze terrain characteristics based on slope and elevation
export function analyzeTerrainCharacteristics(
  slopePercentage: number,
  elevation: number,
  soilType = "loamy",
): TerrainAnalysis {
  // Determine slope category
  let slope_category: TerrainAnalysis["slope_category"]
  if (slopePercentage < 5) slope_category = "gentle"
  else if (slopePercentage < 15) slope_category = "moderate"
  else if (slopePercentage < 30) slope_category = "steep"
  else slope_category = "very_steep"

  // Assess drainage quality
  let drainage_quality: TerrainAnalysis["drainage_quality"]
  if (slopePercentage > 20) drainage_quality = "excellent"
  else if (slopePercentage > 10) drainage_quality = "good"
  else if (slopePercentage > 3) drainage_quality = "moderate"
  else drainage_quality = "poor"

  // Evaluate erosion risk
  let erosion_risk: TerrainAnalysis["erosion_risk"]
  if (slopePercentage > 25) erosion_risk = "critical"
  else if (slopePercentage > 15) erosion_risk = "high"
  else if (slopePercentage > 8) erosion_risk = "medium"
  else erosion_risk = "low"

  // Determine water retention
  let water_retention: TerrainAnalysis["water_retention"]
  if (slopePercentage < 5 && soilType.includes("clay")) water_retention = "high"
  else if (slopePercentage < 15) water_retention = "medium"
  else water_retention = "low"

  // Assess accessibility
  let accessibility: TerrainAnalysis["accessibility"]
  if (slopePercentage < 8) accessibility = "easy"
  else if (slopePercentage < 20) accessibility = "moderate"
  else accessibility = "difficult"

  return {
    slope_percentage: slopePercentage,
    slope_category,
    drainage_quality,
    erosion_risk,
    water_retention,
    accessibility,
  }
}

// Generate comprehensive slope analysis with recommendations
export function generateSlopeAnalysis(
  latitude: number,
  longitude: number,
  elevationData: { elevation: number; distance: number }[],
  plotArea = 1000,
  soilType = "loamy",
): SlopeAnalysisResult {
  const slopePercentage = calculateSlopePercentage(elevationData)
  const avgElevation = elevationData.reduce((sum, point) => sum + point.elevation, 0) / elevationData.length
  const terrain = analyzeTerrainCharacteristics(slopePercentage, avgElevation, soilType)

  // Get zone-based recommendations
  const zoneRecommendations = getZoneBasedCropRecommendations(latitude, longitude, avgElevation, plotArea)

  // Determine irrigation method based on slope
  let irrigation_method: SlopeAnalysisResult["irrigation_recommendations"]["method"]
  let irrigation_frequency: SlopeAnalysisResult["irrigation_recommendations"]["frequency"]
  let duration_minutes: number
  let water_pressure: SlopeAnalysisResult["irrigation_recommendations"]["water_pressure"]

  if (terrain.slope_category === "gentle") {
    irrigation_method = "flood"
    irrigation_frequency = "weekly"
    duration_minutes = 120
    water_pressure = "low"
  } else if (terrain.slope_category === "moderate") {
    irrigation_method = "sprinkler"
    irrigation_frequency = "alternate"
    duration_minutes = 60
    water_pressure = "medium"
  } else {
    irrigation_method = "drip"
    irrigation_frequency = "daily"
    duration_minutes = 30
    water_pressure = "high"
  }

  // Categorize crop suitability based on slope and terrain
  const allCrops = zoneRecommendations.recommendedCrops
  const crop_suitability = {
    excellent: [] as string[],
    good: [] as string[],
    moderate: [] as string[],
    poor: [] as string[],
  }

  allCrops.forEach((crop) => {
    const cropLower = crop.toLowerCase()

    if (terrain.slope_category === "gentle") {
      if (cropLower.includes("paddy") || cropLower.includes("millet")) {
        crop_suitability.excellent.push(crop)
      } else if (cropLower.includes("vegetable") || cropLower.includes("potato")) {
        crop_suitability.good.push(crop)
      } else {
        crop_suitability.moderate.push(crop)
      }
    } else if (terrain.slope_category === "moderate") {
      if (cropLower.includes("fruit") || cropLower.includes("orange") || cropLower.includes("lemon")) {
        crop_suitability.excellent.push(crop)
      } else if (cropLower.includes("vegetable") || cropLower.includes("maize")) {
        crop_suitability.good.push(crop)
      } else if (cropLower.includes("paddy")) {
        crop_suitability.poor.push(crop)
      } else {
        crop_suitability.moderate.push(crop)
      }
    } else {
      if (cropLower.includes("ginger") || cropLower.includes("turmeric") || cropLower.includes("cardamom")) {
        crop_suitability.excellent.push(crop)
      } else if (cropLower.includes("medicinal")) {
        crop_suitability.good.push(crop)
      } else if (cropLower.includes("paddy") || cropLower.includes("millet")) {
        crop_suitability.poor.push(crop)
      } else {
        crop_suitability.moderate.push(crop)
      }
    }
  })

  // Generate conservation measures based on erosion risk
  const conservation_measures: string[] = []

  if (terrain.erosion_risk === "critical" || terrain.erosion_risk === "high") {
    conservation_measures.push("Install terracing or contour farming")
    conservation_measures.push("Plant cover crops between seasons")
    conservation_measures.push("Create drainage channels")
    conservation_measures.push("Use mulching to protect soil")
  }

  if (terrain.erosion_risk === "medium") {
    conservation_measures.push("Implement contour plowing")
    conservation_measures.push("Maintain vegetation strips")
  }

  if (terrain.water_retention === "low") {
    conservation_measures.push("Add organic matter to improve soil structure")
    conservation_measures.push("Install water retention structures")
  }

  if (terrain.accessibility === "difficult") {
    conservation_measures.push("Create access paths for maintenance")
    conservation_measures.push("Consider mechanization limitations")
  }

  // Calculate yield factor based on terrain conditions
  let estimated_yield_factor = 1.0

  if (terrain.slope_category === "gentle" && terrain.drainage_quality === "good") {
    estimated_yield_factor = 1.2
  } else if (terrain.slope_category === "very_steep" || terrain.erosion_risk === "critical") {
    estimated_yield_factor = 0.7
  } else if (terrain.erosion_risk === "high") {
    estimated_yield_factor = 0.8
  } else if (terrain.slope_category === "moderate" && terrain.drainage_quality === "excellent") {
    estimated_yield_factor = 1.1
  }

  return {
    terrain,
    irrigation_recommendations: {
      method: irrigation_method,
      frequency: irrigation_frequency,
      duration_minutes,
      water_pressure,
    },
    crop_suitability,
    conservation_measures,
    estimated_yield_factor,
  }
}

// Generate elevation profile for visualization
export function generateElevationProfile(
  centerLat: number,
  centerLon: number,
  plotArea: number,
  baseElevation = 1000,
  terrainVariation = 50,
): { elevation: number; distance: number; lat: number; lon: number }[] {
  const points = []
  const plotRadius = Math.sqrt(plotArea) / 2
  const numPoints = 20

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI
    const distance = (plotRadius / 111000) * (0.5 + Math.random() * 0.5) // Convert to degrees

    const lat = centerLat + distance * Math.cos(angle)
    const lon = centerLon + distance * Math.sin(angle)

    // Generate realistic elevation variation
    const elevationVariation = (Math.sin(angle * 2) + Math.cos(angle * 3)) * terrainVariation
    const elevation = baseElevation + elevationVariation + (Math.random() - 0.5) * 20

    points.push({
      elevation: Math.round(elevation),
      distance: i * (plotRadius / numPoints),
      lat,
      lon,
    })
  }

  return points.sort((a, b) => a.distance - b.distance)
}
