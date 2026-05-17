// Enhanced Sikkim zone boundaries with polygon coordinates
export const sikkimZoneBoundaries = {
  "North Sikkim": {
    id: "NS",
    name: "North Sikkim",
    description: "High-altitude region with alpine terrain, limited agricultural activity.",
    center: { lat: 27.7, lon: 88.5 },
    boundaries: [
      { lat: 27.9, lon: 88.2 },
      { lat: 28.1, lon: 88.8 },
      { lat: 27.8, lon: 89.0 },
      { lat: 27.5, lon: 88.7 },
      { lat: 27.4, lon: 88.3 },
    ],
    suitable_crops: ["Medicinal Plants", "Barley", "Yak Cheese Production"],
    climate: {
      temperature: { min: -5, max: 15 },
      precipitation: { annual_mm: 1200 },
      humidity: { avg: 70 },
    },
    elevation_range: { min: 1500, max: 8586 },
    agricultural_suitability: "Limited - High altitude farming",
  },
  "Middle Sikkim": {
    id: "MS",
    name: "Middle Sikkim",
    description: "Moderate elevation ideal for diverse crop cultivation and mixed farming.",
    center: { lat: 27.4, lon: 88.5 },
    boundaries: [
      { lat: 27.5, lon: 88.2 },
      { lat: 27.6, lon: 88.8 },
      { lat: 27.3, lon: 88.9 },
      { lat: 27.2, lon: 88.7 },
      { lat: 27.1, lon: 88.3 },
    ],
    suitable_crops: [
      "Orange",
      "Lemon",
      "Papaya",
      "Pineapple",
      "Carrot",
      "Tomato",
      "Ginger",
      "Turmeric",
      "Large Cardamom",
      "Maize",
    ],
    climate: {
      temperature: { min: 12, max: 28 },
      precipitation: { annual_mm: 1600 },
      humidity: { avg: 78 },
    },
    elevation_range: { min: 800, max: 1500 },
    agricultural_suitability: "Excellent - Ideal for fruits, vegetables, and spices",
  },
  "South Sikkim": {
    id: "SS",
    name: "South Sikkim",
    description: "Lower elevation with fertile soil, extensive agricultural activity.",
    center: { lat: 27.2, lon: 88.6 },
    boundaries: [
      { lat: 27.3, lon: 88.3 },
      { lat: 27.4, lon: 88.9 },
      { lat: 27.0, lon: 89.0 },
      { lat: 26.9, lon: 88.8 },
      { lat: 26.8, lon: 88.4 },
    ],
    suitable_crops: ["Paddy", "Leafy Greens", "Potato", "Finger Millet", "Vegetables", "Fruits"],
    climate: {
      temperature: { min: 15, max: 30 },
      precipitation: { annual_mm: 1800 },
      humidity: { avg: 80 },
    },
    elevation_range: { min: 300, max: 800 },
    agricultural_suitability: "Excellent - Perfect for cereals and water-intensive crops",
  },
}

// Point-in-polygon algorithm to determine if coordinates are within zone boundaries
function isPointInPolygon(lat: number, lon: number, polygon: { lat: number; lon: number }[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat,
      yi = polygon[i].lon
    const xj = polygon[j].lat,
      yj = polygon[j].lon

    if (yi > lon !== yj > lon && lat < ((xj - xi) * (lon - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

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

// Enhanced zone classification with polygon boundaries and fallback distance calculation
export function classifyGPSZone(
  latitude: number,
  longitude: number,
): {
  zone: (typeof sikkimZoneBoundaries)[keyof typeof sikkimZoneBoundaries]
  confidence: "high" | "medium" | "low"
  distance_km: number
  method: "polygon" | "distance"
} {
  // First, try polygon-based classification
  for (const [zoneName, zoneData] of Object.entries(sikkimZoneBoundaries)) {
    if (isPointInPolygon(latitude, longitude, zoneData.boundaries)) {
      return {
        zone: zoneData,
        confidence: "high",
        distance_km: 0,
        method: "polygon",
      }
    }
  }

  // Fallback to distance-based classification
  let closestZone = sikkimZoneBoundaries["Middle Sikkim"]
  let minDistance = Number.POSITIVE_INFINITY
  let confidence: "high" | "medium" | "low" = "low"

  for (const [zoneName, zoneData] of Object.entries(sikkimZoneBoundaries)) {
    const distance = calculateDistance(latitude, longitude, zoneData.center.lat, zoneData.center.lon)

    if (distance < minDistance) {
      minDistance = distance
      closestZone = zoneData
    }
  }

  // Determine confidence based on distance
  if (minDistance < 5) confidence = "high"
  else if (minDistance < 15) confidence = "medium"
  else confidence = "low"

  return {
    zone: closestZone,
    confidence,
    distance_km: minDistance,
    method: "distance",
  }
}

// Get slope-based crop recommendations with zone integration
export function getZoneBasedCropRecommendations(
  latitude: number,
  longitude: number,
  elevation: number,
  plotArea = 1000, // square meters
): {
  zone: (typeof sikkimZoneBoundaries)[keyof typeof sikkimZoneBoundaries]
  slope: "high" | "medium" | "low"
  recommendedCrops: string[]
  waterRequirement: number
  irrigationStrategy: string
  plantingCalendar: {
    bestMonths: string[]
    avoidMonths: string[]
  }
  confidence: "high" | "medium" | "low"
} {
  const zoneClassification = classifyGPSZone(latitude, longitude)
  const zone = zoneClassification.zone

  // Determine slope category based on elevation and zone
  let slope: "high" | "medium" | "low"
  if (elevation > zone.elevation_range.max * 0.8) slope = "high"
  else if (elevation > zone.elevation_range.min + (zone.elevation_range.max - zone.elevation_range.min) * 0.4)
    slope = "medium"
  else slope = "low"

  // Get slope-specific crops
  const slopeCrops = {
    high: ["Ginger", "Turmeric", "Large Cardamom", "Medicinal Plants"],
    medium: ["Orange", "Lemon", "Papaya", "Pineapple", "Carrot", "Tomato", "Maize"],
    low: ["Paddy", "Finger Millet", "Leafy Greens", "Potato"],
  }

  // Combine zone and slope recommendations
  const zoneCrops = zone.suitable_crops
  const slopeSpecificCrops = slopeCrops[slope]
  const recommendedCrops = [...new Set([...zoneCrops, ...slopeSpecificCrops])]

  // Calculate water requirement based on zone climate and slope
  const baseWaterRequirement = 100 // liters per day per 1000 sq meters
  const precipitationFactor = zone.climate.precipitation.annual_mm / 1500
  const slopeMultiplier = slope === "low" ? 1.5 : slope === "medium" ? 1.0 : 0.7
  const areaMultiplier = plotArea / 1000

  const waterRequirement = Math.round((baseWaterRequirement / precipitationFactor) * slopeMultiplier * areaMultiplier)

  // Determine irrigation strategy
  const irrigationStrategy =
    slope === "high"
      ? "Drip irrigation recommended for water conservation on steep terrain"
      : slope === "medium"
        ? "Sprinkler or drip irrigation suitable for moderate slopes"
        : "Flood or furrow irrigation effective on flat terrain"

  // Generate planting calendar based on zone climate
  const plantingCalendar = {
    bestMonths:
      zone.climate.temperature.min >= 15 ? ["March", "April", "May", "September", "October"] : ["April", "May", "June"],
    avoidMonths: zone.climate.temperature.min < 10 ? ["December", "January", "February"] : ["January"],
  }

  return {
    zone,
    slope,
    recommendedCrops,
    waterRequirement,
    irrigationStrategy,
    plantingCalendar,
    confidence: zoneClassification.confidence,
  }
}

// Generate subzones for a plot based on GPS and area
export function generatePlotSubzones(
  centerLat: number,
  centerLon: number,
  plotArea: number, // square meters
  elevationData?: { min: number; max: number },
): {
  id: string
  name: string
  coordinates: { lat: number; lon: number }[]
  slope: "high" | "medium" | "low"
  elevation: number
  area: number
  recommendedCrops: string[]
  waterRequirement: number
  irrigationPriority: number
}[] {
  const subzones = []
  const zoneClassification = classifyGPSZone(centerLat, centerLon)

  // Calculate approximate plot dimensions (assuming square plot)
  const plotSideLength = Math.sqrt(plotArea)
  const latOffset = plotSideLength / 111000 // rough conversion: 1 degree ≈ 111km
  const lonOffset = latOffset / Math.cos((centerLat * Math.PI) / 180)

  // Generate 4 subzones for the plot
  const subzoneConfigs = [
    { name: "North Section", latOffset: latOffset / 2, lonOffset: -lonOffset / 2, elevationBonus: 20 },
    { name: "South Section", latOffset: -latOffset / 2, lonOffset: lonOffset / 2, elevationBonus: -10 },
    { name: "East Section", latOffset: lonOffset / 2, lonOffset: latOffset / 2, elevationBonus: 5 },
    { name: "West Section", latOffset: -lonOffset / 2, lonOffset: -latOffset / 2, elevationBonus: 0 },
  ]

  subzoneConfigs.forEach((config, index) => {
    const subzoneLat = centerLat + config.latOffset
    const subzoneLon = centerLon + config.lonOffset
    const baseElevation = elevationData
      ? (elevationData.min + elevationData.max) / 2
      : (zoneClassification.zone.elevation_range.min + zoneClassification.zone.elevation_range.max) / 2
    const elevation = baseElevation + config.elevationBonus

    const recommendations = getZoneBasedCropRecommendations(subzoneLat, subzoneLon, elevation, plotArea / 4)

    subzones.push({
      id: `subzone-${index + 1}`,
      name: config.name,
      coordinates: [
        { lat: subzoneLat + latOffset / 4, lon: subzoneLon - lonOffset / 4 },
        { lat: subzoneLat + latOffset / 4, lon: subzoneLon + lonOffset / 4 },
        { lat: subzoneLat - latOffset / 4, lon: subzoneLon + lonOffset / 4 },
        { lat: subzoneLat - latOffset / 4, lon: subzoneLon - lonOffset / 4 },
      ],
      slope: recommendations.slope,
      elevation: elevation,
      area: plotArea / 4,
      recommendedCrops: recommendations.recommendedCrops.slice(0, 4),
      waterRequirement: recommendations.waterRequirement,
      irrigationPriority: recommendations.slope === "low" ? 1 : recommendations.slope === "medium" ? 2 : 3,
    })
  })

  return subzones
}
