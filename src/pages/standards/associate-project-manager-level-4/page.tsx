import StandardDetailLayout from "@/pages/standards/components/StandardDetailLayout";
import { standards } from "@/mocks/standards";

const standard = standards.find((s) => s.standard_id === "associate-project-manager-level-4")!;

export default function AssociateProjectManagerLevel4() {
  return <StandardDetailLayout standard={standard} />;
}