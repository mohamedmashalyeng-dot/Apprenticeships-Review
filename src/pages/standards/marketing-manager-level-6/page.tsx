import StandardDetailLayout from "@/pages/standards/components/StandardDetailLayout";
import { standards } from "@/mocks/standards";

const standard = standards.find((s) => s.standard_id === "marketing-manager-level-6")!;

export default function MarketingManagerLevel6() {
  return <StandardDetailLayout standard={standard} />;
}