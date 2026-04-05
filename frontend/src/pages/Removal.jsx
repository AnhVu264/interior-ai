import { Eraser } from "lucide-react";
import ToolPage from "../components/ToolPage";

export default function Removal() {
  return (
    <ToolPage
      toolType="item_removal"
      title="Item Removal"
      description="Cleanly erase unwanted objects, clutter, or furniture from any photo."
      icon={Eraser}
      accentColor="from-emerald-500 to-teal-600"
      roomTypes={["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office", "Outdoor"]}
      styles={[]}
      promptPlaceholder="e.g. Remove the old sofa, clean up the cluttered shelves, erase the TV stand..."
    />
  );
}
