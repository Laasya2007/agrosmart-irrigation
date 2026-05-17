import { CropRecommendationSystem } from "@/components/crop-recommendation-system"

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-800">Crop Recommendations</h1>
        <p className="text-muted-foreground mt-2">
          Get personalized crop recommendations based on your plot's location, elevation, and soil conditions
        </p>
      </div>

      <CropRecommendationSystem />
    </div>
  )
}
