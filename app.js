const form = document.querySelector("#risk-form");
const formMessage = document.querySelector("#form-message");
const urbanSampleButton = document.querySelector("#urban-sample-button");
const ruralSampleButton = document.querySelector("#rural-sample-button");
const contextButton = document.querySelector("#context-button");
const contextNote = document.querySelector("#context-note");
const countyList = document.querySelector("#county-list");

const fields = {
  organism: document.querySelector("#organism"),
  detectionStatus: document.querySelector("#detection-status"),
  eventPattern: document.querySelector("#event-pattern"),
  settingType: document.querySelector("#setting-type"),
  county: document.querySelector("#county"),
  population: document.querySelector("#population"),
  acuteCare: document.querySelector("#acute-care"),
  longTermCare: document.querySelector("#long-term-care"),
  transferIntensity: document.querySelector("#transfer-intensity"),
  sharedStaffing: document.querySelector("#shared-staffing"),
  labAccess: document.querySelector("#lab-access"),
  screeningCapacity: document.querySelector("#screening-capacity"),
  ipcReadiness: document.querySelector("#ipc-readiness"),
  notificationWorkflow: document.querySelector("#notification-workflow"),
  visibility: document.querySelector("#visibility"),
  baselineCompleteness: document.querySelector("#baseline-completeness")
};

let countyContext = null;

const ui = {
  title: document.querySelector("#risk-title"),
  summary: document.querySelector("#risk-summary"),
  responsePosture: document.querySelector("#response-posture"),
  confidenceLabel: document.querySelector("#confidence-label"),
  escalationLabel: document.querySelector("#escalation-label"),
  signal: document.querySelector("#metric-signal"),
  spread: document.querySelector("#metric-spread"),
  fragility: document.querySelector("#metric-fragility"),
  confidence: document.querySelector("#metric-confidence"),
  actions: document.querySelector("#action-list"),
  drivers: document.querySelector("#driver-list"),
  warnings: document.querySelector("#warning-list")
};

const organismProfiles = {
  "candida-auris": {
    label: "Candida auris",
    signalBase: 52,
    actionNotes: [
      "Prioritize rapid case communication, contact precautions, and targeted screening where overlap is plausible.",
      "Review environmental disinfection product alignment with Candida auris guidance.",
      "If the county picture is incomplete, widen outreach rather than assuming local containment."
    ]
  },
  "cp-cre": {
    label: "CP-CRE",
    signalBase: 46,
    actionNotes: [
      "Confirm carbapenemase mechanism and notify affected facilities and public health partners quickly.",
      "Focus on transfer relationships, shared patients, and whether colonization screening is feasible.",
      "Use targeted outreach when receiving facilities or post-acute partners may be exposed."
    ]
  },
  crab: {
    label: "CRAB",
    signalBase: 48,
    actionNotes: [
      "Assess ventilator-capable or high-acuity post-acute exposure pathways immediately.",
      "Verify environmental cleaning readiness and handoff communication between facilities.",
      "Escalate faster if network visibility is weak and the setting has prolonged-device care."
    ]
  },
  crpa: {
    label: "CRPA",
    signalBase: 40,
    actionNotes: [
      "Validate organism identification and determine whether transmission is localized or network-linked.",
      "Review potential device-related exposure pathways and acute care transfer routes.",
      "Use confidence warnings to decide whether targeted monitoring is enough or broader outreach is needed."
    ]
  }
};

const scoreMaps = {
  detectionStatus: {
    confirmed: 18,
    suspected: 8,
    screening: 12
  },
  eventPattern: {
    single: 8,
    "epi-link": 18,
    "facility-transmission": 28
  },
  settingType: {
    acute: 8,
    ltc: 14,
    ltach: 20,
    dialysis: 12,
    mixed: 18
  },
  transferIntensity: {
    high: 28,
    medium: 18,
    low: 8,
    unknown: 16
  },
  sharedStaffing: {
    frequent: 18,
    some: 10,
    limited: 4,
    unknown: 10
  },
  labAccess: {
    onsite: 2,
    state: 8,
    limited: 18,
    unknown: 12
  },
  screeningCapacity: {
    strong: 2,
    partial: 10,
    weak: 20,
    unknown: 12
  },
  ipcReadiness: {
    strong: 2,
    partial: 10,
    weak: 20,
    unknown: 12
  },
  notificationWorkflow: {
    strong: 2,
    partial: 10,
    weak: 18,
    unknown: 12
  },
  visibility: {
    strong: 4,
    partial: 12,
    weak: 22,
    unknown: 16
  },
  baselineCompleteness: {
    strong: 2,
    partial: 12,
    weak: 24
  }
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function parseInteger(input) {
  if (!input.value.trim()) {
    return null;
  }
  const value = Number.parseInt(input.value, 10);
  return Number.isFinite(value) ? value : null;
}

function setList(target, items) {
  target.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    target.appendChild(li);
  });
}

function setCountyOptions(context) {
  countyList.innerHTML = "";
  Object.keys(context.counties).sort().forEach((county) => {
    const option = document.createElement("option");
    option.value = county;
    countyList.appendChild(option);
  });
}

async function loadCountyContext() {
  try {
    const response = await fetch("./data/florida_county_facility_context.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    countyContext = await response.json();
    setCountyOptions(countyContext);
    contextNote.textContent = `Official county facility context ready. Source: ${countyContext.source.name} (${new Date(countyContext.generated_at_utc).toLocaleDateString()}).`;
  } catch (error) {
    contextNote.textContent = "Official county facility context could not be loaded in this session.";
  }
}

function confidenceDescriptor(score) {
  if (score >= 80) {
    return "High";
  }
  if (score >= 60) {
    return "Moderate";
  }
  return "Low";
}

function postureLabel(index) {
  return [
    "Routine monitoring",
    "Targeted outreach",
    "Coordinated response",
    "Rapid containment posture"
  ][index];
}

function validate(values) {
  const numericFields = ["population", "acuteCare", "longTermCare"];
  const invalidNumeric = numericFields.find((key) => values[key] !== null && values[key] < 0);
  if (invalidNumeric) {
    formMessage.textContent = "Numeric fields must be zero or greater.";
    return false;
  }

  if (values.population !== null && values.population === 0) {
    formMessage.textContent = "Population cannot be zero if you choose to include it.";
    return false;
  }

  formMessage.textContent = "Assessment updated.";
  return true;
}

function collectValues() {
  return {
    organism: fields.organism.value,
    detectionStatus: fields.detectionStatus.value,
    eventPattern: fields.eventPattern.value,
    settingType: fields.settingType.value,
    county: fields.county.value.trim(),
    population: parseInteger(fields.population),
    acuteCare: parseInteger(fields.acuteCare),
    longTermCare: parseInteger(fields.longTermCare),
    transferIntensity: fields.transferIntensity.value,
    sharedStaffing: fields.sharedStaffing.value,
    labAccess: fields.labAccess.value,
    screeningCapacity: fields.screeningCapacity.value,
    ipcReadiness: fields.ipcReadiness.value,
    notificationWorkflow: fields.notificationWorkflow.value,
    visibility: fields.visibility.value,
    baselineCompleteness: fields.baselineCompleteness.value
  };
}

function getNetworkPoints(values, drivers, warnings) {
  let points = scoreMaps.transferIntensity[values.transferIntensity] + scoreMaps.sharedStaffing[values.sharedStaffing];

  if (values.transferIntensity === "unknown") {
    warnings.push("Interfacility transfer intensity is unknown, so cross-setting spread potential may be underestimated.");
  }

  if (values.population === null) {
    warnings.push("County population is missing, so local network scale is being treated cautiously.");
    points += 10;
  } else if (values.population >= 1000000) {
    points += 18;
    drivers.push(`Large population footprint (${values.population.toLocaleString()}) increases the number of connected care pathways.`);
  } else if (values.population >= 250000) {
    points += 12;
    drivers.push(`Mid-sized population footprint (${values.population.toLocaleString()}) supports moderate cross-setting circulation.`);
  } else {
    points += 6;
    drivers.push(`Smaller population footprint (${values.population.toLocaleString()}) may reduce volume but can still challenge specialty containment capacity.`);
  }

  if (values.acuteCare === null || values.longTermCare === null) {
    warnings.push("Facility counts are incomplete, which lowers certainty around network exposure pathways.");
    points += 12;
  } else {
    const totalFacilities = values.acuteCare + values.longTermCare;
    if (totalFacilities >= 80) {
      points += 18;
      drivers.push(`${totalFacilities} acute and long-term care facilities suggest a dense regional care network.`);
    } else if (totalFacilities >= 20) {
      points += 10;
      drivers.push(`${totalFacilities} facilities indicate meaningful interfacility coordination needs.`);
    } else {
      points += 5;
      drivers.push(`${totalFacilities} facilities suggest a smaller network, but spread could still be consequential if specialty resources are limited.`);
    }
  }

  return clamp(points, 0, 100);
}

function getFragilityPoints(values, drivers, warnings) {
  const points =
    scoreMaps.labAccess[values.labAccess] +
    scoreMaps.screeningCapacity[values.screeningCapacity] +
    scoreMaps.ipcReadiness[values.ipcReadiness] +
    scoreMaps.notificationWorkflow[values.notificationWorkflow];

  if (values.labAccess === "limited" || values.labAccess === "unknown") {
    warnings.push("Confirmatory lab access is delayed or unclear, which can slow case classification and contact decisions.");
  }

  if (values.screeningCapacity === "weak" || values.screeningCapacity === "unknown") {
    drivers.push("Weak screening or contact investigation capacity makes hidden spread harder to rule out.");
  }

  if (values.ipcReadiness === "weak" || values.notificationWorkflow === "weak") {
    drivers.push("Containment readiness gaps increase the chance that one event becomes a multi-facility coordination problem.");
  }

  return clamp(points, 0, 100);
}

function getConfidence(values, warnings) {
  let score = 100;

  if (!values.county) {
    score -= 10;
    warnings.push("County label is missing, so the output cannot yet tie the scenario to a named Florida jurisdiction.");
  }

  if (values.population === null) {
    score -= 12;
  }
  if (values.acuteCare === null) {
    score -= 10;
  }
  if (values.longTermCare === null) {
    score -= 10;
  }

  if (values.detectionStatus !== "confirmed") {
    score -= 12;
    warnings.push("The organism is not yet treated as fully confirmed, which lowers assessment confidence.");
  }

  if (values.visibility === "weak" || values.visibility === "unknown") {
    warnings.push("Surveillance visibility is weak or unclear, so hidden linked events may not yet be visible.");
  }

  if (values.baselineCompleteness !== "strong") {
    warnings.push("County baseline data are incomplete, so the response posture is being interpreted more cautiously.");
  }

  score -= scoreMaps.visibility[values.visibility];
  score -= scoreMaps.baselineCompleteness[values.baselineCompleteness];

  ["transferIntensity", "sharedStaffing", "labAccess", "screeningCapacity", "ipcReadiness", "notificationWorkflow"].forEach((key) => {
    if (values[key] === "unknown") {
      score -= 4;
    }
  });

  return clamp(score, 25, 100);
}

function buildAssessment(values) {
  const organism = organismProfiles[values.organism];
  const drivers = [];
  const warnings = [];

  const signalSeverity = clamp(
    organism.signalBase +
      scoreMaps.detectionStatus[values.detectionStatus] +
      scoreMaps.eventPattern[values.eventPattern] +
      scoreMaps.settingType[values.settingType],
    0,
    100
  );

  if (values.eventPattern !== "single") {
    drivers.push("The event pattern suggests this is no longer an isolated signal.");
  }

  const spreadPotential = getNetworkPoints(values, drivers, warnings);
  const containmentFragility = getFragilityPoints(values, drivers, warnings);
  const confidence = getConfidence(values, warnings);

  let postureIndex = 0;
  const composite = Math.round(signalSeverity * 0.35 + spreadPotential * 0.35 + containmentFragility * 0.3);

  if (composite >= 75 || signalSeverity >= 85) {
    postureIndex = 3;
  } else if (composite >= 55 || spreadPotential >= 65 || containmentFragility >= 65) {
    postureIndex = 2;
  } else if (composite >= 35) {
    postureIndex = 1;
  }

  let conservativeEscalation = false;
  if (confidence < 60 || values.visibility === "weak" || values.baselineCompleteness === "weak") {
    postureIndex = clamp(postureIndex + 1, 0, 3);
    conservativeEscalation = true;
  }

  const countyLabel = values.county || "Unnamed Florida county";
  const actionList = [...organism.actionNotes];

  if (postureIndex >= 2) {
    actionList.unshift(`Coordinate with affected facilities and public health partners in ${countyLabel} rather than managing this as a single-facility event.`);
  } else {
    actionList.unshift(`Maintain jurisdiction-level visibility in ${countyLabel} and verify whether additional linked facilities exist.`);
  }

  if (conservativeEscalation) {
    actionList.push("Treat the response posture one level more cautiously because local visibility is incomplete.");
  }

  return {
    countyLabel,
    signalSeverity,
    spreadPotential,
    containmentFragility,
    confidence,
    confidenceText: confidenceDescriptor(confidence),
    posture: postureLabel(postureIndex),
    conservativeEscalation,
    title: `${organism.label} in ${countyLabel}`,
    summary: `${organism.label} generates a ${signalSeverity >= 75 ? "high" : signalSeverity >= 50 ? "meaningful" : "lower"} intrinsic signal here. The recommended posture reflects the event itself, local spread conditions, containment fragility, and whether missing data forces caution.`,
    actions: actionList,
    drivers: drivers.slice(0, 5),
    warnings: warnings.length ? warnings : ["No major data warnings were triggered in this scenario."]
  };
}

function applyOfficialCountyContext() {
  const county = fields.county.value.trim();
  if (!county) {
    formMessage.textContent = "Enter a Florida county name before applying official context.";
    return;
  }

  if (!countyContext || !countyContext.counties[county]) {
    formMessage.textContent = "No official county facility context was found for that county name.";
    return;
  }

  const context = countyContext.counties[county];
  fields.acuteCare.value = `${context.acute_care_hospitals.facility_count}`;
  fields.longTermCare.value = `${context.nursing_homes.facility_count}`;
  contextNote.textContent = `${county}: ${context.acute_care_hospitals.facility_count} hospitals (${context.acute_care_hospitals.licensed_beds.toLocaleString()} licensed beds) and ${context.nursing_homes.facility_count} nursing homes (${context.nursing_homes.licensed_beds.toLocaleString()} licensed beds) from FloridaHealthFinder.`;
  formMessage.textContent = "Official county facility context applied.";
}

function updateResults(result) {
  ui.title.textContent = result.title;
  ui.summary.textContent = result.summary;
  ui.responsePosture.textContent = result.posture;
  ui.confidenceLabel.textContent = result.confidenceText;
  ui.escalationLabel.textContent = result.conservativeEscalation ? "Triggered" : "Not triggered";
  ui.signal.textContent = `${result.signalSeverity}/100`;
  ui.spread.textContent = `${result.spreadPotential}/100`;
  ui.fragility.textContent = `${result.containmentFragility}/100`;
  ui.confidence.textContent = `${result.confidence}/100`;

  setList(ui.actions, result.actions);
  setList(ui.drivers, result.drivers.length ? result.drivers : ["No major drivers captured from the current inputs."]);
  setList(ui.warnings, result.warnings);
}

function handleSubmit(event) {
  event.preventDefault();
  const values = collectValues();
  if (!validate(values)) {
    return;
  }
  updateResults(buildAssessment(values));
}

function loadScenario(scenario) {
  Object.entries(scenario).forEach(([key, value]) => {
    if (fields[key]) {
      fields[key].value = value;
    }
  });
  formMessage.textContent = "Sample scenario loaded. Generate the assessment to review the posture.";
}

urbanSampleButton.addEventListener("click", () => {
  loadScenario({
    organism: "candida-auris",
    detectionStatus: "confirmed",
    eventPattern: "single",
    settingType: "mixed",
    county: "Miami-Dade",
    population: "2700000",
    acuteCare: "33",
    longTermCare: "120",
    transferIntensity: "high",
    sharedStaffing: "frequent",
    labAccess: "onsite",
    screeningCapacity: "partial",
    ipcReadiness: "partial",
    notificationWorkflow: "strong",
    visibility: "partial",
    baselineCompleteness: "strong"
  });
});

ruralSampleButton.addEventListener("click", () => {
  loadScenario({
    organism: "candida-auris",
    detectionStatus: "suspected",
    eventPattern: "single",
    settingType: "ltc",
    county: "Rural North Florida example",
    population: "32000",
    acuteCare: "1",
    longTermCare: "2",
    transferIntensity: "unknown",
    sharedStaffing: "some",
    labAccess: "state",
    screeningCapacity: "weak",
    ipcReadiness: "partial",
    notificationWorkflow: "partial",
    visibility: "weak",
    baselineCompleteness: "partial"
  });
});

contextButton.addEventListener("click", applyOfficialCountyContext);
form.addEventListener("submit", handleSubmit);
loadCountyContext();
