import { Sofa } from "lucide-react";
import ToolPage from "../components/ToolPage";

export default function Staging() {
  return (
    <ToolPage
      toolType="virtual_staging"
      title="Virtual Staging"
      description="Upload an empty room and let AI furnish it beautifully."
      icon={Sofa}
      accentColor="from-violet-600 to-purple-700"
      roomTypes={["Living Room", "Bedroom", "Dining Room", "Office", "Kitchen", "Bathroom"]}
      styles={["Modern", "Scandinavian", "Industrial", "Bohemian", "Minimalist", "Luxury", "Rustic"]}
      promptPlaceholder="e.g. A cozy living room with warm lighting, wooden floors, and a large sofa..."
    />
  );
}
