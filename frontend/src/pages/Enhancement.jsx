import { Sparkles } from "lucide-react";
import ToolPage from "../components/ToolPage";

export default function Enhancement() {
  return (
    <ToolPage
      toolType="image_enhancement"
      title="Image Enhancement"
      description="Elevate your interior photos with AI-driven lighting and detail boost."
      icon={Sparkles}
      accentColor="from-cyan-500 to-blue-600"
      roomTypes={["Living Room", "Bedroom", "Kitchen", "Bathroom", "Outdoor", "Commercial"]}
      styles={["Natural Light", "Golden Hour", "Bright & Airy", "Moody", "High Contrast", "Warm Tones"]}
      promptPlaceholder="e.g. Enhance the lighting, increase sharpness, make the colors more vibrant..."
    />
  );
}
