export interface Competitor {
  id: string;
  name: string;
  publicStrength: string;
  strategicGap: string;
  kbcResponse: string;
  color: string;
}

export const competitors: Competitor[] = [
  {
    id: "multiverse",
    name: "Multiverse",
    publicStrength: "Clear employer outcomes, AI/data productisation and strong commercial storytelling.",
    strategicGap: "High-scale technology narrative can feel broad and platform-led.",
    kbcResponse: "Own specialist professional recognition, human coaching and work-based evidence in four focused domains.",
    color: "#7C3AED",
  },
  {
    id: "qa",
    name: "QA",
    publicStrength: "Scale, technology capability, employer credibility and 'impact from day one' messaging.",
    strategicGap: "Technology-heavy proposition and wide portfolio.",
    kbcResponse: "Connect AI to management, marketing and project-control judgement rather than selling technology alone.",
    color: "#0D9488",
  },
  {
    id: "bpp",
    name: "BPP",
    publicStrength: "Institutional trust, broad professional portfolio and mature employer journey.",
    strategicGap: "Generalist breadth can reduce specialist distinctiveness.",
    kbcResponse: "Be more personal, specialised and visibly expert in project controls and professional pathways.",
    color: "#B91C1C",
  },
  {
    id: "apprentify",
    name: "Apprentify",
    publicStrength: "Ofsted Outstanding signal, digital/marketing specialism and practitioner-led delivery.",
    strategicGap: "Narrower category and less professional-charter narrative.",
    kbcResponse: "Combine specialist colleges with explicit, controlled professional progression.",
    color: "#D97706",
  },
  {
    id: "corndel",
    name: "Corndel",
    publicStrength: "Executive and leadership positioning, high-profile academic/technology partnerships and business impact.",
    strategicGap: "Premium executive focus may be less accessible to broad working-professional audiences.",
    kbcResponse: "Create employer-grade leadership and strategic capability with funded accessibility and close support.",
    color: "#2563EB",
  },
  {
    id: "professional-bodies",
    name: "Professional Bodies",
    publicStrength: "Authority, standards, communities and recognised status.",
    strategicGap: "They are not always end-to-end apprenticeship providers.",
    kbcResponse: "Position KBC as the guided bridge between funded learning, applied evidence and external professional recognition.",
    color: "#BE185D",
  },
];