import { Hammer } from "lucide-react";
import ToolPage from "../components/ToolPage";

export default function Renovation() {
  return (
    <ToolPage
      toolType="virtual_renovation"
      title="Virtual Renovation"
      description="Visualize renovations before breaking a single wall."
      icon={Hammer}
      accentColor="from-orange-500 to-red-600"
      roomTypes={["Living Room", "Bedroom", "Kitchen", "Bathroom", "Hallway", "Basement"]}
      styles={["Modern", "Contemporary", "Traditional", "Coastal", "Mid-Century", "Japandi"]}
      promptPlaceholder="e.g. Replace the flooring with dark hardwood, add an open-plan kitchen island..."
    />
  );
}
