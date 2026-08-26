import StandardDetailLayout from "@/pages/standards/components/StandardDetailLayout";
import { standards } from "@/mocks/standards";

const standard = standards.find((s) => s.standard_id === "project-controls-professional-level-6")!;

export default function ProjectControlsProfessionalLevel6() {
  return <StandardDetailLayout standard={standard} />;
}