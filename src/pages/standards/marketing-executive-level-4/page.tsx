import StandardDetailLayout from "@/pages/standards/components/StandardDetailLayout";
import { standards } from "@/mocks/standards";

const standard = standards.find((s) => s.standard_id === "marketing-executive-level-4")!;

export default function MarketingExecutiveLevel4() {
  return <StandardDetailLayout standard={standard} />;
}