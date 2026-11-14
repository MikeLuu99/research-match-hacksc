// All data here is FICTIONAL demo data. Not affiliated with or endorsed by USC.
export type RecruitStatus = "open" | "exploration" | "closed";
export type Level = "beginner" | "intermediate" | "advanced";

export interface Project {
  id: string;
  title: string;
  lab: string;
  pi: string;
  department: string;
  summary: string;
  description: string;
  requiredSkills: string[];
  niceSkills: string[];
  minHours: number;
  maxHours: number;
  paid: boolean;
  credit: boolean;
  status: RecruitStatus;
  level: Level;
  eligibleMajors: string[]; // "Any" allowed
  keywords: string[];
}

export interface StudentProfile {
  id: string;
  name: string;
  major: string;
  year: string;
  skills: string[];
  interests: string[];
  hours: number;
  wantsCredit: boolean;
  wantsPaid: boolean;
  bio: string;
  resumeText: string;
  visible: boolean;
}

export const DEPARTMENTS = [
  "Preventive Medicine",
  "Computer Science",
  "Earth Sciences",
  "Linguistics",
  "Psychology",
  "Biomedical Engineering",
  "Aerospace & Mechanical Eng.",
  "Public Policy",
];

export const SEED_PROJECTS: Project[] = [
  {
    id: "p-sentinel",
    title: "Early disease detection from routine lab panels",
    lab: "Sentinel Health Signals Lab (demo)",
    pi: "Dr. Imani Okafor (fictional)",
    department: "Preventive Medicine",
    summary: "Train interpretable ML models that flag early kidney disease risk from de-identified bloodwork trends.",
    description:
      "We study whether small changes across years of routine blood panels can predict chronic kidney disease before diagnosis. Students help clean longitudinal tabular data, build baseline gradient-boosted and logistic models, and examine fairness across patient subgroups. All data used in training is de-identified and accessed under IRB protocol.",
    requiredSkills: ["Python", "Machine Learning", "Statistics"],
    niceSkills: ["pandas", "scikit-learn", "Healthcare data"],
    minHours: 8,
    maxHours: 12,
    paid: false,
    credit: true,
    status: "open",
    level: "intermediate",
    eligibleMajors: ["Any"],
    keywords: ["healthcare", "disease detection", "clinical", "fairness", "prediction", "medicine"],
  },
  {
    id: "p-cohab",
    title: "Human-robot collaboration in shared kitchens",
    lab: "Cohabit Robotics Group (demo)",
    pi: "Prof. Daniel Reyes-Whitlock (fictional)",
    department: "Aerospace & Mechanical Eng.",
    summary: "Model how people hand off objects to a robot arm and design motion that feels predictable.",
    description:
      "We record human-robot handovers in a mock kitchen and learn motion policies that people rate as legible and safe. Students run user studies, annotate video, and prototype trajectory planners in ROS.",
    requiredSkills: ["Python", "ROS"],
    niceSkills: ["Computer Vision", "User Studies", "C++"],
    minHours: 10,
    maxHours: 15,
    paid: true,
    credit: true,
    status: "open",
    level: "advanced",
    eligibleMajors: ["Computer Science", "Mechanical Engineering", "Aerospace Engineering"],
    keywords: ["robotics", "human-robot interaction", "motion planning", "assistive", "safety"],
  },
  {
    id: "p-coastline",
    title: "Coastal heat and air quality data atlas",
    lab: "Coastline Climate Data Studio (demo)",
    pi: "Dr. Mei-Lin Charbonneau (fictional)",
    department: "Earth Sciences",
    summary: "Merge satellite and sensor data to map neighborhood-level extreme heat across Los Angeles.",
    description:
      "We combine satellite land-surface temperature, low-cost air sensors, and census data to show which neighborhoods carry the most heat burden. Students build data pipelines, interactive maps, and short public-facing explainers.",
    requiredSkills: ["Python", "Data Visualization"],
    niceSkills: ["GIS", "SQL", "Climate science"],
    minHours: 6,
    maxHours: 10,
    paid: true,
    credit: false,
    status: "open",
    level: "beginner",
    eligibleMajors: ["Any"],
    keywords: ["climate", "environment", "heat", "maps", "public health", "geospatial"],
  },
  {
    id: "p-lexicon",
    title: "How bilingual children learn new words",
    lab: "Lexicon Development Lab (demo)",
    pi: "Prof. Sofía Arriaga-Beaumont (fictional)",
    department: "Linguistics",
    summary: "Analyze eye-tracking and speech recordings to see how bilingual toddlers map words to meaning.",
    description:
      "Students help code eye-tracking sessions, transcribe child speech, and run mixed-effects models. Programmers can help automate gaze annotation pipelines. No prior linguistics background required.",
    requiredSkills: ["Statistics"],
    niceSkills: ["R", "Python", "Spanish", "Natural Language Processing"],
    minHours: 5,
    maxHours: 10,
    paid: false,
    credit: true,
    status: "exploration",
    level: "beginner",
    eligibleMajors: ["Any"],
    keywords: ["language", "cognition", "children", "bilingual", "eye tracking", "speech"],
  },
  {
    id: "p-wearable",
    title: "Wearable sensors for post-surgery recovery",
    lab: "Motion and Recovery Lab (demo)",
    pi: "Dr. Kwame Asante-Lindqvist (fictional)",
    department: "Biomedical Engineering",
    summary: "Turn accelerometer streams into recovery indicators clinicians can actually read.",
    description:
      "We pair wrist and ankle sensors with physical therapy outcomes after knee surgery. Students engineer time-series features, build classifiers, and design dashboards reviewed with clinicians.",
    requiredSkills: ["Python", "Signal Processing", "Machine Learning"],
    niceSkills: ["Time series", "Healthcare data", "React"],
    minHours: 10,
    maxHours: 14,
    paid: true,
    credit: true,
    status: "open",
    level: "intermediate",
    eligibleMajors: ["Any"],
    keywords: ["healthcare", "wearables", "rehabilitation", "sensors", "clinical", "time series"],
  },
  {
    id: "p-memory",
    title: "Sleep, memory, and language replay",
    lab: "Night Cognition Lab (demo)",
    pi: "Prof. Harriet Nakamura-Osei (fictional)",
    department: "Psychology",
    summary: "Test whether cueing words during sleep strengthens vocabulary learning.",
    description:
      "Students assist with participant scheduling, EEG preprocessing, and analysis of memory tests. Lab exploration only this term: meet the team, sit in on lab meetings, and see if it fits for next semester.",
    requiredSkills: ["Statistics"],
    niceSkills: ["MATLAB", "Python", "EEG"],
    minHours: 4,
    maxHours: 8,
    paid: false,
    credit: true,
    status: "exploration",
    level: "beginner",
    eligibleMajors: ["Any"],
    keywords: ["memory", "sleep", "cognition", "neuroscience", "language"],
  },
  {
    id: "p-triage",
    title: "Fair triage language models for clinic messages",
    lab: "Clinical Language Equity Lab (demo)",
    pi: "Dr. Rohan Vasquez-Iyer (fictional)",
    department: "Preventive Medicine",
    summary: "Audit how NLP models prioritize patient portal messages across language and literacy levels.",
    description:
      "We evaluate whether automated message triage treats patients differently depending on writing style or language. Students build evaluation sets, run model audits, and write findings for clinical partners.",
    requiredSkills: ["Python", "Natural Language Processing"],
    niceSkills: ["Machine Learning", "Healthcare data", "Ethics"],
    minHours: 8,
    maxHours: 12,
    paid: false,
    credit: true,
    status: "open",
    level: "intermediate",
    eligibleMajors: ["Any"],
    keywords: ["healthcare", "nlp", "fairness", "clinical", "language", "equity"],
  },
  {
    id: "p-transit",
    title: "Transit access and clinic no-shows",
    lab: "Urban Mobility Policy Lab (demo)",
    pi: "Prof. Elena Marchetti-Owusu (fictional)",
    department: "Public Policy",
    summary: "Link bus schedule data to missed appointments at community clinics.",
    description:
      "Recruiting has closed for this term. The lab studies whether transit reliability explains missed medical appointments using GTFS feeds and anonymized scheduling data.",
    requiredSkills: ["SQL", "Statistics"],
    niceSkills: ["Python", "GIS"],
    minHours: 6,
    maxHours: 10,
    paid: true,
    credit: false,
    status: "closed",
    level: "intermediate",
    eligibleMajors: ["Any"],
    keywords: ["transit", "policy", "healthcare access", "urban", "equity"],
  },
  {
    id: "p-proteins",
    title: "Protein folding visual explorer",
    lab: "Molecular Interfaces Lab (demo)",
    pi: "Dr. Tobias Ferreira-Kim (fictional)",
    department: "Computer Science",
    summary: "Build a browser tool that lets biologists compare predicted protein structures.",
    description:
      "Students build a WebGL viewer and comparison metrics for predicted protein structures, working closely with biology collaborators.",
    requiredSkills: ["JavaScript", "React"],
    niceSkills: ["WebGL", "Python", "Biology"],
    minHours: 8,
    maxHours: 12,
    paid: true,
    credit: true,
    status: "open",
    level: "intermediate",
    eligibleMajors: ["Computer Science", "Computational Biology"],
    keywords: ["biology", "visualization", "proteins", "web", "tools"],
  },
];

export const ALEX: StudentProfile = {
  id: "s-alex",
  name: "Alex Morgan",
  major: "Computer Science",
  year: "Junior",
  skills: ["Python", "Machine Learning", "pandas", "scikit-learn", "SQL"],
  interests: ["healthcare", "disease detection", "fairness", "clinical data"],
  hours: 10,
  wantsCredit: true,
  wantsPaid: false,
  bio: "Sample student (fictional). CS junior curious about how ML can help clinicians catch illness earlier.",
  resumeText: "",
  visible: false,
};

// Other fictional demo students who have opted in to faculty visibility.
export const DEMO_STUDENTS: StudentProfile[] = [
  {
    id: "s-priya",
    name: "Priya Lindgren-Shah",
    major: "Biomedical Engineering",
    year: "Senior",
    skills: ["Python", "Signal Processing", "MATLAB", "Machine Learning"],
    interests: ["wearables", "rehabilitation", "healthcare"],
    hours: 12,
    wantsCredit: false,
    wantsPaid: true,
    bio: "Fictional demo student.",
    resumeText: "Built a gait classifier from IMU data for a capstone.",
    visible: true,
  },
  {
    id: "s-marcus",
    name: "Marcus Oyelaran",
    major: "Linguistics",
    year: "Sophomore",
    skills: ["R", "Statistics", "Spanish"],
    interests: ["language", "children", "bilingual", "cognition"],
    hours: 8,
    wantsCredit: true,
    wantsPaid: false,
    bio: "Fictional demo student.",
    resumeText: "Volunteer tutor; transcribed interviews for an oral history project.",
    visible: true,
  },
  {
    id: "s-june",
    name: "June Takahashi-Brooks",
    major: "Environmental Studies",
    year: "Junior",
    skills: ["GIS", "Data Visualization", "Python", "SQL"],
    interests: ["climate", "heat", "public health", "maps"],
    hours: 9,
    wantsCredit: false,
    wantsPaid: true,
    bio: "Fictional demo student.",
    resumeText: "Mapped tree canopy coverage for a neighborhood council.",
    visible: true,
  },
  {
    id: "s-diego",
    name: "Diego Valcourt",
    major: "Computer Science",
    year: "Senior",
    skills: ["Python", "Natural Language Processing", "Machine Learning", "React"],
    interests: ["nlp", "fairness", "healthcare", "language"],
    hours: 10,
    wantsCredit: true,
    wantsPaid: false,
    bio: "Fictional demo student.",
    resumeText: "Fine-tuned text classifiers; TA for intro data science.",
    visible: true,
  },
];

export const MAJORS = [
  "Computer Science",
  "Biomedical Engineering",
  "Linguistics",
  "Psychology",
  "Environmental Studies",
  "Mechanical Engineering",
  "Computational Biology",
  "Public Policy",
  "Undeclared",
];
