// Generated from public/data/usc-research.json by scripts/generate-usc-projects.mjs.
// Public USC lab catalog for the Convex projects table; embeddings are added
// at seed time. Statuses reflect public pages, not lab-confirmed vacancies.
export type LabRecord = {
  sourceId: string;
  title: string;
  department: string;
  description: string;
  faculty: string;
  requiredSkills: string[];
  preferredSkills: string[];
  hoursPerWeek: number;
  offersCredit: boolean;
  beginnerFriendly: boolean;
  recruitmentStatus: "open" | "closed" | "explore";
  sourceUrl: string;
};

export const LABS: LabRecord[] = [
  {
    "sourceId": "usc-role-001",
    "title": "USC undergraduate / MS volunteer",
    "department": "Viterbi / Aerospace and Mechanical Engineering",
    "description": "Agile and robust robot locomotion using nonlinear control, trajectory optimization and machine learning. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Quan Nguyen",
    "requiredSkills": [
      "robotics",
      "control",
      "optimization",
      "reinforcement learning",
      "legged robots"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://sites.usc.edu/quann/"
  },
  {
    "sourceId": "usc-role-002",
    "title": "Prospective PhD",
    "department": "Viterbi / Aerospace and Mechanical Engineering",
    "description": "Agile and robust robot locomotion using nonlinear control, trajectory optimization and machine learning. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Quan Nguyen",
    "requiredSkills": [
      "robotics",
      "control",
      "optimization",
      "reinforcement learning",
      "legged robots"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "open",
    "sourceUrl": "https://sites.usc.edu/quann/"
  },
  {
    "sourceId": "usc-role-003",
    "title": "USC undergraduate / MS research inquiry",
    "department": "Viterbi / Aerospace and Mechanical Engineering",
    "description": "Fluid mechanics and flow-structure interactions with applications in flow control, soft robotics and environmental science. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Mitul Luhar",
    "requiredSkills": [
      "fluid mechanics",
      "soft robotics",
      "environmental science",
      "experiments",
      "theory"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://sites.usc.edu/fsi/"
  },
  {
    "sourceId": "usc-role-004",
    "title": "Undergraduate researcher",
    "department": "Dornsife",
    "description": "Homeostatic control of synaptic activity, using Drosophila genetics, molecular and cell biology, electrophysiology and imaging. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Dion K. Dickman",
    "requiredSkills": [
      "neuroscience",
      "synapses",
      "Drosophila",
      "genetics",
      "electrophysiology",
      "imaging"
    ],
    "preferredSkills": [
      "Drosophila genetics",
      "Molecular",
      "cell biology",
      "Electrophysiology",
      "Imaging"
    ],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://dornsife.usc.edu/dickmanlab/"
  },
  {
    "sourceId": "usc-role-005",
    "title": "Graduate research student",
    "department": "Dornsife",
    "description": "Homeostatic control of synaptic activity, using Drosophila genetics, molecular and cell biology, electrophysiology and imaging. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Dion K. Dickman",
    "requiredSkills": [
      "neuroscience",
      "synapses",
      "Drosophila",
      "genetics",
      "electrophysiology",
      "imaging"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "open",
    "sourceUrl": "https://dornsife.usc.edu/dickmanlab/"
  },
  {
    "sourceId": "usc-role-006",
    "title": "Undergraduate / masters researcher",
    "department": "Viterbi / Electrical Engineering",
    "description": "Spiking neural networks, neuromorphic computing, carbon nanotubes, two-dimensional materials and bionanotechnology. Recruitment status from a public source, not confirmed by the lab: September 2024 recruiting notice; current availability unverified.",
    "faculty": "Chongwu Zhou",
    "requiredSkills": [
      "neuromorphic computing",
      "spiking neural networks",
      "nanomaterials",
      "carbon nanotubes",
      "bionanotechnology"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://nanolab.usc.edu/"
  },
  {
    "sourceId": "usc-role-007",
    "title": "PhD researcher",
    "department": "Viterbi / Electrical Engineering",
    "description": "Spiking neural networks, neuromorphic computing, carbon nanotubes, two-dimensional materials and bionanotechnology. Recruitment status from a public source, not confirmed by the lab: September 2024 notice; departments named as welcomed routes, not an exhaustive exclusion rule.",
    "faculty": "Chongwu Zhou",
    "requiredSkills": [
      "neuromorphic computing",
      "spiking neural networks",
      "nanomaterials",
      "carbon nanotubes",
      "bionanotechnology"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://nanolab.usc.edu/"
  },
  {
    "sourceId": "usc-role-008",
    "title": "Undergraduate via CURVE",
    "department": "Viterbi / Robotics and Autonomous Systems Center",
    "description": "Experimental robotics, multi-robot and networked systems, planning and optimization, environmental monitoring, learning and manipulation. Recruitment status from a public source, not confirmed by the lab: Suitable projects are listed through CURVE when available; no RESL vacancy verified.",
    "faculty": "Gaurav S. Sukhatme",
    "requiredSkills": [
      "robotics",
      "multi-robot systems",
      "planning",
      "robot learning",
      "manipulation",
      "environmental monitoring"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://uscresl.org/"
  },
  {
    "sourceId": "usc-role-009",
    "title": "Masters project researcher",
    "department": "Viterbi / Robotics and Autonomous Systems Center",
    "description": "Experimental robotics, multi-robot and networked systems, planning and optimization, environmental monitoring, learning and manipulation. Recruitment status from a public source, not confirmed by the lab: Join page explicitly says there are no current MS openings.",
    "faculty": "Gaurav S. Sukhatme",
    "requiredSkills": [
      "robotics",
      "multi-robot systems",
      "planning",
      "robot learning",
      "manipulation",
      "environmental monitoring"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "closed",
    "sourceUrl": "https://uscresl.org/"
  },
  {
    "sourceId": "usc-role-010",
    "title": "Admitted or enrolled PhD researcher",
    "department": "Viterbi / Robotics and Autonomous Systems Center",
    "description": "Experimental robotics, multi-robot and networked systems, planning and optimization, environmental monitoring, learning and manipulation. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Gaurav S. Sukhatme",
    "requiredSkills": [
      "robotics",
      "multi-robot systems",
      "planning",
      "robot learning",
      "manipulation",
      "environmental monitoring"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "open",
    "sourceUrl": "https://uscresl.org/"
  },
  {
    "sourceId": "usc-role-011",
    "title": "Undergraduate volunteer interest list",
    "department": "Dornsife / Psychology",
    "description": "Emotion regulation and vulnerability to mood disorders, using fMRI, autonomic physiology, wearables, ecological momentary assessment and smartphone-based measures. Recruitment status from a public source, not confirmed by the lab: No undergraduate volunteer openings; interest form is for future availability.",
    "faculty": "Jonathan P. Stange",
    "requiredSkills": [
      "psychology",
      "depression",
      "emotion regulation",
      "fMRI",
      "wearables",
      "digital phenotyping"
    ],
    "preferredSkills": [
      "Research methods coursework",
      "Python or Matlab",
      "Psychophysiology",
      "ambulatory assessment or neuroimaging"
    ],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "closed",
    "sourceUrl": "https://dornsife.usc.edu/car-lab/"
  },
  {
    "sourceId": "usc-role-012",
    "title": "Research availability not established",
    "department": "Dornsife / Marine and Environmental Biology",
    "description": "Marine microbial cellular decision-making and ocean biogeochemical cycles using environmental proteomics, quantitative biology and systems biology. Recruitment status from a public source, not confirmed by the lab: Research profile found; student levels sought, major eligibility and openings not published in checked sources.",
    "faculty": "Noelle Held",
    "requiredSkills": [
      "marine microbiology",
      "proteomics",
      "systems biology",
      "biogeochemistry"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://proteoceanlab.github.io/"
  },
  {
    "sourceId": "usc-role-013",
    "title": "Research availability not established",
    "department": "Dornsife / Marine and Environmental Biology",
    "description": "Genetic and environmental effects on coral and anemone traits, local adaptation, symbiosis, and applications to conservation and coral restoration. Recruitment status from a public source, not confirmed by the lab: Research profile found; student levels sought, major eligibility and openings not published in checked sources.",
    "faculty": "Carly Kenkel",
    "requiredSkills": [
      "corals",
      "climate change",
      "ecology",
      "evolution",
      "genomics",
      "conservation"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://dornsife.usc.edu/carlslab/"
  },
  {
    "sourceId": "usc-role-014",
    "title": "Research availability not established",
    "department": "Dornsife / Earth Sciences and Marine and Environmental Biology",
    "description": "Carbon and energy sources of subsurface microorganisms, combining genomics and other molecular approaches with geochemical measurements. Recruitment status from a public source, not confirmed by the lab: Research profile found; student levels sought, major eligibility and openings not published in checked sources.",
    "faculty": "Karen G. Lloyd",
    "requiredSkills": [
      "microbiology",
      "biogeochemistry",
      "bioinformatics",
      "deep biosphere",
      "genomics"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://dornsife.usc.edu/lloyd/"
  },
  {
    "sourceId": "usc-role-015",
    "title": "Research availability not established",
    "department": "Dornsife / Marine and Environmental Biology",
    "description": "Conservation, population and evolutionary genetics, including copepod models of reproductive isolation, stress tolerance and aging, and island fox genetics. Recruitment status from a public source, not confirmed by the lab: Research profile found; student levels sought, major eligibility and openings not published in checked sources.",
    "faculty": "Suzanne Edmands",
    "requiredSkills": [
      "conservation genetics",
      "evolution",
      "population genetics",
      "aging",
      "environmental stress"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://dornsife.usc.edu/profile/suzanne-edmands/"
  },
  {
    "sourceId": "usc-role-016",
    "title": "Undergraduate research assistant",
    "department": "Dornsife / Psychology",
    "description": "Development of infant social brains using behavioral, computational and neuroimaging methods. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Heather L. Kosakowski",
    "requiredSkills": [
      "developmental neuroscience",
      "infants",
      "fMRI"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": true,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://dornsife.usc.edu/hklab/"
  },
  {
    "sourceId": "usc-role-017",
    "title": "Prospective psychology graduate student",
    "department": "Dornsife / Psychology",
    "description": "Development of infant social brains using behavioral, computational and neuroimaging methods. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Heather L. Kosakowski",
    "requiredSkills": [
      "developmental neuroscience",
      "infants",
      "fMRI"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "open",
    "sourceUrl": "https://dornsife.usc.edu/hklab/"
  },
  {
    "sourceId": "usc-role-018",
    "title": "Undergraduate volunteer (not accepting)",
    "department": "Dornsife / Psychology",
    "description": "Alcohol-use research, biosensors and behavioral measurement. Recruitment status from a public source, not confirmed by the lab: Page states the lab is currently not taking any students.",
    "faculty": "Susan E. Luczak",
    "requiredSkills": [
      "addiction",
      "alcohol",
      "biosensors"
    ],
    "preferredSkills": [
      "Research methods",
      "Statistical research packages"
    ],
    "hoursPerWeek": 9,
    "offersCredit": true,
    "beginnerFriendly": true,
    "recruitmentStatus": "closed",
    "sourceUrl": "https://dornsife.usc.edu/susan-luczak/"
  },
  {
    "sourceId": "usc-role-019",
    "title": "Undergraduate volunteer RA",
    "department": "Keck / Health Behavior Research",
    "description": "Women’s emotional and physical health, tobacco addiction, ecological momentary assessment and behavioral pharmacology. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Raina Pang",
    "requiredSkills": [
      "women’s health",
      "addiction",
      "EMA"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 9,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://powerlab.usc.edu/"
  },
  {
    "sourceId": "usc-role-020",
    "title": "Prospective doctoral student",
    "department": "Keck / Health Behavior Research",
    "description": "Women’s emotional and physical health, tobacco addiction, ecological momentary assessment and behavioral pharmacology. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Raina Pang",
    "requiredSkills": [
      "women’s health",
      "addiction",
      "EMA"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "open",
    "sourceUrl": "https://powerlab.usc.edu/"
  },
  {
    "sourceId": "usc-role-021",
    "title": "Course-credit undergraduate RA",
    "department": "Dornsife / Psychology",
    "description": "Context, feelings, culture, motivation and their effects on judgments and behavior. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Norbert Schwarz, Daphna Oyserman",
    "requiredSkills": [
      "social psychology",
      "motivation",
      "decision-making"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": true,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://dornsife.usc.edu/mindandsociety/"
  },
  {
    "sourceId": "usc-role-022",
    "title": "Undergraduate research/teaching assistant",
    "department": "Marshall School of Business",
    "description": "Behavioral research support across business departments; research and teaching assistant matching. Recruitment status from a public source, not confirmed by the lab: Applications closed on checked date; next cycle announced for November 30 for Spring 2027.",
    "faculty": "Faculty (see lab page)",
    "requiredSkills": [
      "business",
      "behavioral science",
      "surveys"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 12.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "closed",
    "sourceUrl": "https://students.marshall.usc.edu/research/marshall-behavioral-research-lab"
  },
  {
    "sourceId": "usc-role-023",
    "title": "Masters research/teaching assistant",
    "department": "Marshall School of Business",
    "description": "Behavioral research support across business departments; research and teaching assistant matching. Recruitment status from a public source, not confirmed by the lab: Applications closed on checked date; next cycle announced for November 30 for Spring 2027.",
    "faculty": "Faculty (see lab page)",
    "requiredSkills": [
      "business",
      "behavioral science",
      "surveys"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 12.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "closed",
    "sourceUrl": "https://students.marshall.usc.edu/research/marshall-behavioral-research-lab"
  },
  {
    "sourceId": "usc-role-024",
    "title": "COMM 494 research practicum",
    "department": "Annenberg / Communication",
    "description": "Representation, equity and inclusion in film, television and music. Recruitment status from a public source, not confirmed by the lab: Undated standing course description; current section availability not verified.",
    "faculty": "Stacy Smith",
    "requiredSkills": [
      "media",
      "representation",
      "content analysis"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": true,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://annenberg.usc.edu/aii"
  },
  {
    "sourceId": "usc-role-025",
    "title": "Student database / research collaborator",
    "department": "Annenberg / Norman Lear Center",
    "description": "How depictions of journalists across popular culture shape public perceptions. Recruitment status from a public source, not confirmed by the lab: Undated description links to older materials; confirm current opportunity.",
    "faculty": "Joe Saltzman",
    "requiredSkills": [
      "journalism",
      "media",
      "popular culture"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": true,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://annenberg.usc.edu/undergraduate-student-research-opportunities"
  },
  {
    "sourceId": "usc-role-026",
    "title": "¡Vivir Mi Vida! lifestyle intervention volunteer",
    "department": "Chan / Occupational Science and Occupational Therapy",
    "description": "Studies ways to help older adults stay healthy and participate in meaningful activities, with a focus on technology-supported interventions. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Stacey Schepens Niemiec",
    "requiredSkills": [
      "CITI Human Subjects",
      "Good Clinical Practice",
      "Research HIPAA training"
    ],
    "preferredSkills": [
      "Spanish-English bilingual skills",
      "Writing",
      "Literature searching",
      "REDCap",
      "Remote collaboration"
    ],
    "hoursPerWeek": 8,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://chan.usc.edu/research/labs/hart"
  },
  {
    "sourceId": "usc-role-027",
    "title": "Diabetic foot ulcer lifestyle intervention volunteer",
    "department": "Chan / Occupational Science and Occupational Therapy",
    "description": "Studies ways to help older adults stay healthy and participate in meaningful activities, with a focus on technology-supported interventions. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Stacey Schepens Niemiec",
    "requiredSkills": [
      "healthy aging",
      "occupational therapy",
      "lifestyle interventions"
    ],
    "preferredSkills": [
      "Literature searching",
      "REDCap",
      "Remote collaboration",
      "Qualitative",
      "quantitative software"
    ],
    "hoursPerWeek": 8,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://chan.usc.edu/research/labs/hart"
  },
  {
    "sourceId": "usc-role-028",
    "title": "Student lab volunteer",
    "department": "Chan / Occupational Science and Occupational Therapy",
    "description": "Studies how care, surroundings and therapy in neonatal intensive care affect the brain development and later abilities of babies born very early. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Bobbi Pineda",
    "requiredSkills": [
      "neonatal therapy",
      "video coding"
    ],
    "preferredSkills": [
      "Interest in neonatal therapy"
    ],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://chan.usc.edu/research/volunteer-opportunities"
  },
  {
    "sourceId": "usc-role-029",
    "title": "USC undergraduate / masters researcher",
    "department": "Viterbi / Computer Science",
    "description": "Natural language processing, machine learning and data mining. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Sean (Xiang) Ren",
    "requiredSkills": [
      "NLP",
      "machine learning",
      "data mining"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://inklab.usc.edu/contact.html"
  },
  {
    "sourceId": "usc-role-030",
    "title": "Visiting undergraduate / masters intern",
    "department": "Viterbi / Computer Science",
    "description": "Natural language processing, machine learning and data mining. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Sean (Xiang) Ren",
    "requiredSkills": [
      "NLP",
      "machine learning",
      "data mining"
    ],
    "preferredSkills": [
      "Recommendation by collaborator",
      "external funding are typical",
      "not stated as absolute requirements"
    ],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://inklab.usc.edu/contact.html"
  },
  {
    "sourceId": "usc-role-031",
    "title": "Prospective CS PhD",
    "department": "Viterbi / Computer Science",
    "description": "Natural language processing, machine learning and data mining. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Sean (Xiang) Ren",
    "requiredSkills": [
      "NLP",
      "machine learning",
      "data mining"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "open",
    "sourceUrl": "https://inklab.usc.edu/contact.html"
  },
  {
    "sourceId": "usc-role-032",
    "title": "USC undergraduate researcher",
    "department": "Viterbi / Electrical and Computer Engineering; Dornsife / Physics and Astronomy",
    "description": "Nanophotonic structures and infrared optical responses for communications, energy and other applications. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Michelle Povinelli",
    "requiredSkills": [
      "nanophotonics",
      "optics",
      "infrared"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://nanophotonicslab.usc.edu/"
  },
  {
    "sourceId": "usc-role-033",
    "title": "Prospective PhD",
    "department": "Viterbi / Electrical and Computer Engineering; Dornsife / Physics and Astronomy",
    "description": "Nanophotonic structures and infrared optical responses for communications, energy and other applications. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Michelle Povinelli",
    "requiredSkills": [
      "nanophotonics",
      "optics",
      "infrared"
    ],
    "preferredSkills": [
      "Optics",
      "electromagnetics",
      "Scientific programming",
      "Computational modeling",
      "Experimental optics",
      "microfabrication"
    ],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "open",
    "sourceUrl": "https://nanophotonicslab.usc.edu/"
  },
  {
    "sourceId": "usc-role-034",
    "title": "Undergraduate quantum research",
    "department": "Dornsife / Physics and Astronomy",
    "description": "Spin, photon and magnon interactions in quantum materials and devices. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Kelly Luo",
    "requiredSkills": [
      "quantum materials",
      "spintronics",
      "ultrafast optics"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://sites.usc.edu/kellyluolab"
  },
  {
    "sourceId": "usc-role-035",
    "title": "Prospective graduate quantum researcher",
    "department": "Dornsife / Physics and Astronomy",
    "description": "Spin, photon and magnon interactions in quantum materials and devices. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Kelly Luo",
    "requiredSkills": [
      "quantum materials",
      "spintronics",
      "ultrafast optics"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "open",
    "sourceUrl": "https://sites.usc.edu/kellyluolab"
  },
  {
    "sourceId": "usc-role-036",
    "title": "Undergraduate / graduate research",
    "department": "Mann / Pharmacy and Pharmaceutical Sciences",
    "description": "Chemical biology and translational medicine at the interface of chemistry and biology. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Yong (Tiger) Zhang",
    "requiredSkills": [
      "chemical biology",
      "translational medicine"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://sites.usc.edu/zhang/"
  },
  {
    "sourceId": "usc-role-037",
    "title": "Student research availability unknown",
    "department": "Mann / Pharmacy and Pharmaceutical Sciences",
    "description": "Protein-drug conjugates and fusion proteins for targeted and intracellular drug delivery. Recruitment status from a public source, not confirmed by the lab: Research profile only; no student recruitment criteria established.",
    "faculty": "Jennica Zaro",
    "requiredSkills": [
      "drug delivery",
      "biologics"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://sites.usc.edu/zaro/"
  },
  {
    "sourceId": "usc-role-038",
    "title": "Undergraduate researcher",
    "department": "Leonard Davis / Gerontology",
    "description": "Genomic regulation of aging and age-related disease using omics, machine learning and vertebrate models. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Bérénice Benayoun",
    "requiredSkills": [
      "aging",
      "genomics",
      "machine learning"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 10,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://gero.usc.edu/labs/benayounlab"
  },
  {
    "sourceId": "usc-role-039",
    "title": "Graduate researcher",
    "department": "Leonard Davis / Gerontology",
    "description": "Genomic regulation of aging and age-related disease using omics, machine learning and vertebrate models. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Bérénice Benayoun",
    "requiredSkills": [
      "aging",
      "genomics",
      "machine learning"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "open",
    "sourceUrl": "https://gero.usc.edu/labs/benayounlab"
  },
  {
    "sourceId": "usc-role-040",
    "title": "Masters / PhD research",
    "department": "Price / Urban Planning and Spatial Analysis",
    "description": "Spatial outcomes of urban planning, street networks, housing and urban data science. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Geoff Boeing",
    "requiredSkills": [
      "urban planning",
      "spatial analysis",
      "data science"
    ],
    "preferredSkills": [
      "Coding",
      "Data science"
    ],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "open",
    "sourceUrl": "https://geoffboeing.com/lab"
  },
  {
    "sourceId": "usc-role-041",
    "title": "Undergraduate research assistant",
    "department": "Dornsife / Political Science and International Relations",
    "description": "Climate, security and economic development; police-community interaction video analysis. Recruitment status from a public source, not confirmed by the lab: RA application is explicitly marked closed.",
    "faculty": "Faculty (see lab page)",
    "requiredSkills": [
      "Reliability",
      "Independent deadlines",
      "Attention to detail"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 6.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "closed",
    "sourceUrl": "https://www.uscspec.org/about/get-involved"
  },
  {
    "sourceId": "usc-role-042",
    "title": "Everyday Respect student video annotator",
    "department": "Dornsife / Political Science and International Relations",
    "description": "Climate, security and economic development; police-community interaction video analysis. Recruitment status from a public source, not confirmed by the lab: Button says Open but text specifically names remainder of Spring 2026 and Summer 2026; current cycle unconfirmed.",
    "faculty": "Faculty (see lab page)",
    "requiredSkills": [
      "Computer",
      "Attention to detail",
      "Nondisclosure",
      "media-policy agreements"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 12.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "closed",
    "sourceUrl": "https://www.uscspec.org/about/get-involved"
  },
  {
    "sourceId": "usc-role-043",
    "title": "Undergraduate research assistant",
    "department": "Dornsife / Linguistics",
    "description": "Language comprehension/production and integration of information during processing using eye tracking. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Elsi Kaiser",
    "requiredSkills": [
      "linguistics",
      "psycholinguistics",
      "eye tracking"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://elsikaiser.com/usc-language-processing-lab/"
  },
  {
    "sourceId": "usc-role-044",
    "title": "Student research availability unknown",
    "department": "Dornsife / Linguistics",
    "description": "Real-time processing by monolingual and heritage speakers using visual-world eye tracking. Recruitment status from a public source, not confirmed by the lab: Lab and student involvement described; no RA vacancy or eligibility verified. Participant mailing list is not an RA application.",
    "faculty": "Zuzanna Fuchs",
    "requiredSkills": [
      "linguistics",
      "multilingualism",
      "eye tracking"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://www.zuzannazfuchs.com/pommlab.html"
  },
  {
    "sourceId": "usc-role-045",
    "title": "Undergraduate translation research collaborator",
    "department": "Dornsife / Classics",
    "description": "Collaborative editions and translations of early modern works connecting European and Chinese intellectual history. Recruitment status from a public source, not confirmed by the lab: Knowledge of Latin and classical Chinese is the group’s target expertise; no degree-major restriction is published.",
    "faculty": "Lucas Herchenroeder, Stefano Rebeggiani",
    "requiredSkills": [
      "classics",
      "translation",
      "intellectual history"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://dornsife.usc.edu/clas/undergraduate-working-group-in-latin-chinese-translation-studies/"
  },
  {
    "sourceId": "usc-role-046",
    "title": "Undergraduate researcher",
    "department": "Viterbi / Chemical Engineering; Dornsife / Chemistry and Molecular and Computational Biology",
    "description": "Peptide and protein engineering and drug/diagnostic discovery using mRNA display. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Richard Roberts",
    "requiredSkills": [
      "protein engineering",
      "chemistry",
      "drug discovery"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://mrnadisplay.usc.edu/"
  },
  {
    "sourceId": "usc-role-047",
    "title": "Prospective PhD researcher",
    "department": "Viterbi / Chemical Engineering; Dornsife / Chemistry and Molecular and Computational Biology",
    "description": "Peptide and protein engineering and drug/diagnostic discovery using mRNA display. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Richard Roberts",
    "requiredSkills": [
      "protein engineering",
      "chemistry",
      "drug discovery"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "open",
    "sourceUrl": "https://mrnadisplay.usc.edu/"
  },
  {
    "sourceId": "usc-role-048",
    "title": "Undergraduate EMA research assistant (historical)",
    "department": "Dornsife / Center for Economic and Social Research",
    "description": "Self-report accuracy, ecological momentary assessment and behavioral measurement. Recruitment status from a public source, not confirmed by the lab: Listed in Fall 2025–Spring 2026 directory; that recruiting cycle is past. Current opening unverified.",
    "faculty": "Arthur A. Stone, Doerte U. Junghaenel",
    "requiredSkills": [
      "survey methods",
      "EMA",
      "health psychology"
    ],
    "preferredSkills": [
      "Human-subject research",
      "EMA",
      "Statistics",
      "software",
      "Online data collection"
    ],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://dornsife.usc.edu/cesr/center-for-self-report-science/"
  },
  {
    "sourceId": "usc-role-049",
    "title": "Undergraduate motor-development RA (historical)",
    "department": "Biokinesiology and Physical Therapy",
    "description": "Motor control, coordination and treatment effects in infants and young children with and without disabilities. Recruitment status from a public source, not confirmed by the lab: Listed in Fall 2025–Spring 2026 directory; that recruiting cycle is past. Current opening unverified.",
    "faculty": "Stacey Dusing",
    "requiredSkills": [
      "Reliability",
      "Attention to detail",
      "Teamwork"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 10,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://sites.usc.edu/mdl/"
  },
  {
    "sourceId": "usc-role-050",
    "title": "Academic-year volunteer research assistant",
    "department": "Dornsife / Brain and Creativity Institute",
    "description": "Music listening/playing, brain development and well-being using EEG, MRI and psychometric measures. Recruitment status from a public source, not confirmed by the lab: Contact page update August 2026 says accepting applications; reviewed as space permits.",
    "faculty": "Assal Habibi",
    "requiredSkills": [
      "music",
      "neuroscience",
      "development"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 10,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://dornsife.usc.edu/brainandmusic/"
  },
  {
    "sourceId": "usc-role-051",
    "title": "Summer volunteer research assistant",
    "department": "Dornsife / Brain and Creativity Institute",
    "description": "Music listening/playing, brain development and well-being using EEG, MRI and psychometric measures. Recruitment status from a public source, not confirmed by the lab: Contact page update August 2026 says accepting applications; reviewed as space permits.",
    "faculty": "Assal Habibi",
    "requiredSkills": [
      "music",
      "neuroscience",
      "development"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 15,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://dornsife.usc.edu/brainandmusic/"
  },
  {
    "sourceId": "usc-role-052",
    "title": "Graduate student researcher",
    "department": "Dornsife / Brain and Creativity Institute",
    "description": "Music listening/playing, brain development and well-being using EEG, MRI and psychometric measures. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Assal Habibi",
    "requiredSkills": [
      "music",
      "neuroscience",
      "development"
    ],
    "preferredSkills": [
      "Electrophysiology",
      "Neuroimaging",
      "Computer programming"
    ],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "open",
    "sourceUrl": "https://dornsife.usc.edu/brainandmusic/"
  },
  {
    "sourceId": "usc-role-053",
    "title": "Undergraduate observational-video coder (historical)",
    "department": "Rossier School of Education",
    "description": "Educational motivation, agency, persistence and intervention effectiveness. Recruitment status from a public source, not confirmed by the lab: Listed in Fall 2025–Spring 2026 directory; that recruiting cycle is past. Current opening unverified.",
    "faculty": "Erika A. Patall",
    "requiredSkills": [
      "education",
      "motivation",
      "STEM persistence"
    ],
    "preferredSkills": [
      "Prior research experience"
    ],
    "hoursPerWeek": 10,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": ""
  },
  {
    "sourceId": "usc-role-054",
    "title": "Undergraduate / DPT research assistant",
    "department": "Biokinesiology and Physical Therapy",
    "description": "Early motor behavior, learning and interventions for infants/children with developmental disabilities. Recruitment status from a public source, not confirmed by the lab: Live joining page accepts undergraduate and DPT RAs on a rolling basis.",
    "faculty": "Kari Kretch",
    "requiredSkills": [
      "rehabilitation",
      "child development",
      "wearable technology"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://sites.usc.edu/ldrlab/"
  },
  {
    "sourceId": "usc-role-055",
    "title": "Prospective Biokinesiology PhD",
    "department": "Biokinesiology and Physical Therapy",
    "description": "Early motor behavior, learning and interventions for infants/children with developmental disabilities. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Kari Kretch",
    "requiredSkills": [
      "rehabilitation",
      "child development",
      "wearable technology"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "open",
    "sourceUrl": "https://sites.usc.edu/ldrlab/"
  },
  {
    "sourceId": "usc-role-056",
    "title": "Undergraduate neurodiversity RA (historical)",
    "department": "CHLA / USC-listed affiliated research",
    "description": "Mental health in autistic/neurodivergent youth and adapted treatments using EEG, interviews and behavioral methods. Recruitment status from a public source, not confirmed by the lab: Listed in Fall 2025–Spring 2026 directory; that recruiting cycle is past. Current opening unverified.",
    "faculty": "Jessica Schwartzman",
    "requiredSkills": [
      "autism",
      "youth mental health",
      "EEG"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 9,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://www.chla.org/research/lab/training-and-research-empower-neurodiversity-trend"
  },
  {
    "sourceId": "usc-role-057",
    "title": "Undergraduate digital-health RA (historical)",
    "department": "CHLA / USC-listed affiliated research",
    "description": "Youth-centered digital interventions, medication adherence and health literacy. Recruitment status from a public source, not confirmed by the lab: Listed in Fall 2025–Spring 2026 directory; that recruiting cycle is past. Current opening unverified.",
    "faculty": "Caitlin Sayegh",
    "requiredSkills": [
      "digital health",
      "human-centered design",
      "youth"
    ],
    "preferredSkills": [
      "Qualitative interviewing",
      "analysis",
      "REDCap",
      "Randomized pilot trials"
    ],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://www.chla.org/research/lab/dash"
  },
  {
    "sourceId": "usc-role-058",
    "title": "Undergraduate developmental RA (historical)",
    "department": "Dornsife / Psychology",
    "description": "Temperament, emotional development, attention and developmental neuroscience. Recruitment status from a public source, not confirmed by the lab: Listed in Fall 2025–Spring 2026 directory; that recruiting cycle is past. Current opening unverified.",
    "faculty": "Santiago Morales",
    "requiredSkills": [
      "developmental psychology",
      "EEG",
      "emotion"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://dornsife.usc.edu/bead/"
  },
  {
    "sourceId": "usc-role-059",
    "title": "Undergraduate language-development RA (historical)",
    "department": "Dornsife / Psychology",
    "description": "Interaction of language and cognition across infancy, childhood and adulthood. Recruitment status from a public source, not confirmed by the lab: Listed in Fall 2025–Spring 2026 directory; that recruiting cycle is past. Current opening unverified.",
    "faculty": "Sandy LaTourrette",
    "requiredSkills": [
      "language development",
      "cognition",
      "eye tracking"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://dornsife.usc.edu/childlab/"
  },
  {
    "sourceId": "usc-role-060",
    "title": "Volunteer research assistant interest form",
    "department": "Dornsife / Psychology and Brain and Creativity Institute; Chan",
    "description": "Sensorimotor contributions to language, social cognition and human–AI interactions. Recruitment status from a public source, not confirmed by the lab: Standing public invitation; actual vacancy not independently confirmed.",
    "faculty": "Lisa Aziz-Zadeh",
    "requiredSkills": [
      "social neuroscience",
      "embodied cognition",
      "human–AI interaction"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://dornsife.usc.edu/cenec/"
  },
  {
    "sourceId": "usc-role-061",
    "title": "Undergraduate clinical-trial RA (historical)",
    "department": "Keck / Population and Public Health Sciences; Institute for Addiction Science",
    "description": "Addiction risk and clinical trials of GLP-1 receptor agonists for substance-use disorders. Recruitment status from a public source, not confirmed by the lab: Listed in Fall 2025–Spring 2026 directory; that recruiting cycle is past. Current opening unverified.",
    "faculty": "Christian Hendershot",
    "requiredSkills": [
      "addiction",
      "clinical trials",
      "GLP-1"
    ],
    "preferredSkills": [
      "Human-subjects research",
      "Data analysis",
      "programming"
    ],
    "hoursPerWeek": 9,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://ias.usc.edu/clinical-research-facilities/"
  },
  {
    "sourceId": "usc-role-062",
    "title": "Student research availability unknown",
    "department": "Price School of Public Policy",
    "description": "Cartographic narratives, public engagement and visualization of marginalized urban spaces and people. Recruitment status from a public source, not confirmed by the lab: Research assistants are listed; current recruitment and eligibility not established.",
    "faculty": "Annette M. Kim",
    "requiredSkills": [
      "urban planning",
      "cartography",
      "public policy"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://slab.today/"
  },
  {
    "sourceId": "usc-role-063",
    "title": "Interdisciplinary student project participation",
    "department": "USC / Creative media and behavioral health (interdisciplinary)",
    "description": "Creative media, games, storytelling and health-related interventions. Recruitment status from a public source, not confirmed by the lab: Collaboration page describes participation model, not a specific current vacancy.",
    "faculty": "Marientina Gotsis",
    "requiredSkills": [
      "games",
      "media arts",
      "behavioral health"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": true,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://cmbhc.usc.edu/"
  },
  {
    "sourceId": "usc-role-064",
    "title": "Undergraduate research assistant (historical)",
    "department": "Dornsife / Psychology",
    "description": "Mood/anxiety disorders and emotional development in children and adolescents using fMRI, experiments and daily-life measures. Recruitment status from a public source, not confirmed by the lab: Listed in Fall 2025–Spring 2026 directory; that recruiting cycle is past. Current opening unverified.",
    "faculty": "Katharina Kircanski",
    "requiredSkills": [
      "youth mental health",
      "fMRI",
      "EMA"
    ],
    "preferredSkills": [
      "Prior research",
      "Work with children",
      "families",
      "R"
    ],
    "hoursPerWeek": 10,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://dornsife.usc.edu/mesolab/"
  },
  {
    "sourceId": "usc-role-065",
    "title": "Prospective student research inquiry",
    "department": "Viterbi / Electrical and Computer Engineering and Biomedical Engineering; joint ITEMS initiative with Keck",
    "description": "Develops wearable, implantable and swallowable sensors to measure health, brain activity and behavior, including applications in mental health. Recruitment status from a public source, not confirmed by the lab: Open Positions section invites prospective students; degree level and vacancy count not specified.",
    "faculty": "Yasser Khan",
    "requiredSkills": [
      "medical devices",
      "bioelectronics",
      "wearable sensors",
      "precision psychiatry"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://khan.usc.edu/"
  },
  {
    "sourceId": "usc-role-066",
    "title": "Student opportunity details not established",
    "department": "USC Chan Division of Occupational Science and Occupational Therapy",
    "description": "Studies how people with illness or disabilities and their families experience daily life and healthcare, including how families and clinicians work across cultural differences. Recruitment status from a public source, not confirmed by the lab: Research profile verified; no student opening, eligibility or schedule established from checked source.",
    "faculty": "Mary Lawlor",
    "requiredSkills": [
      "health disparities",
      "disability",
      "family experience",
      "qualitative research"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://chan.usc.edu/research/labs/boundary-crossings"
  },
  {
    "sourceId": "usc-role-067",
    "title": "Student opportunity details not established",
    "department": "USC Chan Division of Occupational Science and Occupational Therapy",
    "description": "Studies unequal access to autism diagnosis and care, using healthcare data and community collaboration to improve mental health and other services. Recruitment status from a public source, not confirmed by the lab: Research profile verified; no student opening, eligibility or schedule established from checked source.",
    "faculty": "Amber Angell",
    "requiredSkills": [
      "autism",
      "health equity",
      "clinical informatics",
      "community-engaged research"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://chan.usc.edu/research/labs/dreams"
  },
  {
    "sourceId": "usc-role-068",
    "title": "Student opportunity details not established",
    "department": "USC Chan Division of Occupational Science and Occupational Therapy",
    "description": "Tests changes to healthcare environments to reduce stress and improve care experiences, including dental visits and care for autistic people. Recruitment status from a public source, not confirmed by the lab: Research profile verified; no student opening, eligibility or schedule established from checked source.",
    "faculty": "Leah Stein Duker",
    "requiredSkills": [
      "sensory environments",
      "autism",
      "healthcare experience",
      "intervention research"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://chan.usc.edu/research/labs/enable"
  },
  {
    "sourceId": "usc-role-069",
    "title": "Student opportunity details not established",
    "department": "USC Chan Division of Occupational Science and Occupational Therapy",
    "description": "Works with communities to improve healthcare access, social connection and quality of life for underserved people and those with serious mental illness. Recruitment status from a public source, not confirmed by the lab: Research profile verified; no student opening, eligibility or schedule established from checked source.",
    "faculty": "Joy Agner",
    "requiredSkills": [
      "health equity",
      "mental health",
      "peer support",
      "community partnerships"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://chan.usc.edu/research/labs/heal"
  },
  {
    "sourceId": "usc-role-070",
    "title": "Student opportunity details not established",
    "department": "USC Chan Division of Occupational Science and Occupational Therapy",
    "description": "Develops and evaluates approaches that help people manage daily life with chronic conditions such as diabetes and arthritis, especially in underserved communities. Recruitment status from a public source, not confirmed by the lab: Research profile verified; no student opening, eligibility or schedule established from checked source.",
    "faculty": "Beth Pyatak",
    "requiredSkills": [
      "diabetes",
      "arthritis",
      "occupational therapy",
      "chronic disease management"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://chan.usc.edu/research/labs/lrcc"
  },
  {
    "sourceId": "usc-role-071",
    "title": "Student opportunity details not established",
    "department": "USC Chan Division of Occupational Science and Occupational Therapy",
    "description": "Studies how the brain changes during learning and recovery after stroke, and tests technologies that could personalize rehabilitation. Recruitment status from a public source, not confirmed by the lab: Research profile verified; no student opening, eligibility or schedule established from checked source.",
    "faculty": "Sook-Lei Liew",
    "requiredSkills": [
      "stroke",
      "brain plasticity",
      "virtual reality",
      "neurorehabilitation"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://chan.usc.edu/research/labs/npnl"
  },
  {
    "sourceId": "usc-role-072",
    "title": "Student recruitment currently closed",
    "department": "Viterbi / Computer Science",
    "description": "Studies how language AI models work, what their limits are, and how better data and evaluation can make them more useful and reliable. Recruitment status from a public source, not confirmed by the lab: Page explicitly says no PhD, masters or undergraduate recruitment at present; existing/visiting PhD research collaborations are separate.",
    "faculty": "Swabha Swayamdipta",
    "requiredSkills": [
      "natural language processing",
      "language models",
      "data quality",
      "AI evaluation"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "closed",
    "sourceUrl": "https://dill-lab.github.io/"
  },
  {
    "sourceId": "usc-role-073",
    "title": "Prospective PhD — possible Fall 2027 position",
    "department": "Viterbi / Computer Science",
    "description": "Builds devices and software that recreate the sense of touch, making robots and virtual-reality experiences feel more natural and useful. Recruitment status from a public source, not confirmed by the lab: PI says likely one PhD position for Fall 2027; this is tentative, not a guaranteed funded vacancy.",
    "faculty": "Heather Culbertson",
    "requiredSkills": [
      "haptics",
      "robotics",
      "virtual reality",
      "human perception"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://sites.usc.edu/culbertson/"
  },
  {
    "sourceId": "usc-role-074",
    "title": "Undergraduate / masters research — monitor cyclic postings",
    "department": "Viterbi / Computer Science",
    "description": "Builds devices and software that recreate the sense of touch, making robots and virtual-reality experiences feel more natural and useful. Recruitment status from a public source, not confirmed by the lab: Positions described as limited/cyclical, usually beginning of semester; no specific undergraduate/masters vacancy established.",
    "faculty": "Heather Culbertson",
    "requiredSkills": [
      "haptics",
      "robotics",
      "virtual reality",
      "human perception"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://sites.usc.edu/culbertson/"
  },
  {
    "sourceId": "usc-role-075",
    "title": "Student opportunity details not established",
    "department": "Viterbi; listed in Computer Science research directory",
    "description": "Uses speech, language, images and body signals to understand human behavior and develop human-centered technologies for health, media and communication. Recruitment status from a public source, not confirmed by the lab: Research profile verified; no student opening, eligibility or schedule established from checked source.",
    "faculty": "Shrikanth Narayanan",
    "requiredSkills": [
      "speech processing",
      "behavioral AI",
      "biosignals",
      "multimodal machine learning"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://sail.usc.edu/"
  },
  {
    "sourceId": "usc-role-076",
    "title": "USC undergraduate / masters project inquiry",
    "department": "Viterbi / Computer Science",
    "description": "Develops robots that collaborate with people on everyday tasks, using human–robot interaction research and simulated scenarios to improve reliability. Recruitment status from a public source, not confirmed by the lab: PI welcomes fit-based inquiries; students are contacted if a matching opening becomes available.",
    "faculty": "Stefanos Nikolaidis",
    "requiredSkills": [
      "human–robot interaction",
      "robotics",
      "scenario generation",
      "robot collaboration"
    ],
    "preferredSkills": [
      "not stated as mandatory"
    ],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "http://icaros.usc.edu/"
  },
  {
    "sourceId": "usc-role-077",
    "title": "Prospective Computer Science PhD",
    "department": "Viterbi / Computer Science",
    "description": "Develops robots that collaborate with people on everyday tasks, using human–robot interaction research and simulated scenarios to improve reliability. Recruitment status from a public source, not confirmed by the lab: Formal PhD application route published; specific funded vacancy not confirmed.",
    "faculty": "Stefanos Nikolaidis",
    "requiredSkills": [
      "human–robot interaction",
      "robotics",
      "scenario generation",
      "robot collaboration"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "open",
    "sourceUrl": "http://icaros.usc.edu/"
  },
  {
    "sourceId": "usc-role-078",
    "title": "Student opportunity details not established",
    "department": "Keck / USC Stem Cell",
    "description": "Studies how stem cells switch on to repair damaged muscle, with the long-term aim of improving therapies for injury and muscle disease. Recruitment status from a public source, not confirmed by the lab: Research profile verified; no student opening, eligibility or schedule established from checked source.",
    "faculty": "Faculty (see lab page)",
    "requiredSkills": [
      "stem cells",
      "muscle regeneration",
      "regenerative medicine"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://almadalab.usc.edu/"
  },
  {
    "sourceId": "usc-role-079",
    "title": "Volunteer research inquiry",
    "department": "Keck School of Medicine / USC Norris",
    "description": "Develops ways to measure and engineer therapeutic cells and genes so cell-based treatments can become safer, more effective and easier to bring to patients. Recruitment status from a public source, not confirmed by the lab: Page welcomes volunteers and PhD candidates. Listed staff/postdoc jobs are not student opportunities.",
    "faculty": "Mohamed Abou-el-Enein",
    "requiredSkills": [
      "cell therapy",
      "gene engineering",
      "immunotherapy",
      "translational medicine"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "open",
    "sourceUrl": "https://aboueleneinlab.usc.edu/"
  },
  {
    "sourceId": "usc-role-080",
    "title": "Prospective PhD candidate inquiry",
    "department": "Keck School of Medicine / USC Norris",
    "description": "Develops ways to measure and engineer therapeutic cells and genes so cell-based treatments can become safer, more effective and easier to bring to patients. Recruitment status from a public source, not confirmed by the lab: Page welcomes volunteers and PhD candidates. Listed staff/postdoc jobs are not student opportunities.",
    "faculty": "Mohamed Abou-el-Enein",
    "requiredSkills": [
      "cell therapy",
      "gene engineering",
      "immunotherapy",
      "translational medicine"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": false,
    "recruitmentStatus": "open",
    "sourceUrl": "https://aboueleneinlab.usc.edu/"
  },
  {
    "sourceId": "usc-role-081",
    "title": "Student opportunity details not established",
    "department": "Keck School of Medicine research directory",
    "description": "Studies how cells remember their identity through chemical changes to DNA and its packaging, using genetics, genomics and synthetic biology. Recruitment status from a public source, not confirmed by the lab: Research profile verified; no student opening, eligibility or schedule established from checked source.",
    "faculty": "Faculty (see lab page)",
    "requiredSkills": [
      "epigenetics",
      "chromatin",
      "cell identity",
      "synthetic biology"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://belllab.usc.edu/"
  },
  {
    "sourceId": "usc-role-082",
    "title": "Student opportunity details not established",
    "department": "Price School of Public Policy",
    "description": "Studies democratic governance and public decision-making, and shares research through discussions, workshops and civic education. Recruitment status from a public source, not confirmed by the lab: Research profile verified; no student opening, eligibility or schedule established from checked source.",
    "faculty": "Faculty (see lab page)",
    "requiredSkills": [
      "governance",
      "democracy",
      "public policy"
    ],
    "preferredSkills": [],
    "hoursPerWeek": 7.5,
    "offersCredit": false,
    "beginnerFriendly": true,
    "recruitmentStatus": "explore",
    "sourceUrl": "https://bedrosian.usc.edu/"
  }
];
