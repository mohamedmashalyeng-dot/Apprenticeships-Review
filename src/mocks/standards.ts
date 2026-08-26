export interface Standard {
  standard_id: string;
  standard_name: string;
  level: number;
  sector: string;
  description: string;
  who_for: string;
  typical_learner: string;
  typical_employer: string;
  duration: string;
  max_funding: string;
}

export const standards: Standard[] = [
  {
    standard_id: "marketing-executive-level-4",
    standard_name: "Marketing Executive",
    level: 4,
    sector: "Marketing & Communications",
    description: "The Marketing Executive Level 4 apprenticeship equips learners with the skills to deliver marketing campaigns, manage digital channels, analyse market data, and support brand growth within an organisation. Apprentices develop competencies in campaign planning, content creation, data analysis, and stakeholder communication.",
    who_for: "Aspiring marketing professionals looking to start or progress their marketing career with a recognised qualification and practical workplace experience.",
    typical_learner: "School leavers, career changers, or existing marketing assistants/junior executives seeking formal qualification. Typically aged 18-30 with an interest in digital marketing, communications, and brand strategy.",
    typical_employer: "SMEs, marketing agencies, in-house marketing teams in medium-to-large organisations, public sector communications teams, and charities requiring structured marketing capability development.",
    duration: "18 months (typical)",
    max_funding: "£9,000",
  },
  {
    standard_id: "marketing-manager-level-6",
    standard_name: "Marketing Manager",
    level: 6,
    sector: "Marketing & Communications",
    description: "The Marketing Manager Level 6 degree apprenticeship develops strategic marketing leadership skills, covering brand management, marketing strategy, digital innovation, budget management, and team leadership. Equivalent to a Bachelor's degree level qualification.",
    who_for: "Experienced marketing professionals ready to step into management roles, or graduates seeking a work-based route to strategic marketing leadership.",
    typical_learner: "Marketing executives or coordinators with 2+ years of experience, or graduates wanting a work-based degree route. Typically aged 22-40 with demonstrated marketing experience and leadership potential.",
    typical_employer: "Medium-to-large organisations with dedicated marketing functions, marketing agencies developing senior talent, public sector organisations with strategic communications needs, and corporates building internal marketing leadership pipelines.",
    duration: "36 months (typical)",
    max_funding: "£22,000",
  },
  {
    standard_id: "associate-project-manager-level-4",
    standard_name: "Associate Project Manager",
    level: 4,
    sector: "Project Management",
    description: "The Associate Project Manager Level 4 apprenticeship develops core project management competencies including project planning, risk management, stakeholder engagement, budget monitoring, and project governance. Apprentices learn to manage project lifecycles and deliver successful project outcomes.",
    who_for: "Individuals starting their project management career who want to develop structured project delivery skills and gain a recognised professional qualification.",
    typical_learner: "Career starters, project coordinators, or administrators transitioning into project management roles. Typically aged 18-35 with strong organisational skills and interest in structured project delivery.",
    typical_employer: "Organisations across all sectors that run projects — construction, IT, professional services, public sector, events, manufacturing — looking to develop project delivery capability at entry-to-mid level.",
    duration: "24 months (typical)",
    max_funding: "£6,000",
  },
  {
    standard_id: "project-controls-professional-level-6",
    standard_name: "Project Controls Professional",
    level: 6,
    sector: "Project Management",
    description: "The Project Controls Professional Level 6 degree apprenticeship develops advanced skills in project controls, including cost engineering, planning and scheduling, risk management, change control, and performance reporting across complex projects and programmes.",
    who_for: "Experienced project professionals seeking to specialise in project controls, cost engineering, and programme performance management at a strategic level.",
    typical_learner: "Project managers, project engineers, cost engineers, or planners with 3+ years of project experience. Typically aged 25-45 with strong analytical skills and experience in project delivery environments.",
    typical_employer: "Large infrastructure organisations, construction companies, energy and utilities, defence, aerospace, transport, and government departments managing complex capital projects and programmes.",
    duration: "48 months (typical)",
    max_funding: "£22,000",
  },
];

export const additionalStandards: Standard[] = [
  {
    standard_id: "digital-marketer-level-3",
    standard_name: "Digital Marketer",
    level: 3,
    sector: "Marketing & Communications",
    description: "The Digital Marketer Level 3 apprenticeship covers the foundations of digital marketing, including social media, email marketing, SEO, content creation, and digital analytics.",
    who_for: "Entry-level marketing roles, school leavers, and those new to digital marketing.",
    typical_learner: "School leavers and career starters with interest in digital media and marketing. Typically aged 16-25.",
    typical_employer: "Digital agencies, in-house marketing teams, SMEs building digital presence, and any organisation with digital marketing needs.",
    duration: "15 months (typical)",
    max_funding: "£6,000",
  },
  {
    standard_id: "business-administrator-level-3",
    standard_name: "Business Administrator",
    level: 3,
    sector: "Business & Administration",
    description: "The Business Administrator Level 3 apprenticeship develops core business administration skills including communication, project support, IT skills, and business process management.",
    who_for: "Individuals starting a career in business administration and office-based roles.",
    typical_learner: "School leavers and entry-level administrators, typically aged 16-25.",
    typical_employer: "All types of organisations with administrative functions — SMEs, large corporates, public sector, and charities.",
    duration: "18 months (typical)",
    max_funding: "£5,000",
  },
  {
    standard_id: "operations-manager-level-5",
    standard_name: "Operations / Departmental Manager",
    level: 5,
    sector: "Management & Leadership",
    description: "The Operations Manager Level 5 apprenticeship develops operational management skills including team leadership, project management, financial awareness, and operational planning.",
    who_for: "Practising or aspiring middle managers looking to formalise their management capabilities.",
    typical_learner: "Team leaders, supervisors, and junior managers, typically aged 22-45.",
    typical_employer: "Organisations across all sectors seeking to develop middle management capability.",
    duration: "30 months (typical)",
    max_funding: "£7,000",
  },
];